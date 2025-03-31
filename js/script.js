    // ===== TEMA AUTOMÁTICO (Navegador/Sistema) + Alternância Manual =====
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon();
    }

    function loadTheme() {
      const savedTheme = localStorage.getItem('theme');
      const browserTheme = prefersDarkScheme.matches ? 'dark' : 'light';
      const theme = savedTheme || browserTheme;
      applyTheme(theme);
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    }

    function updateThemeIcon() {
      const themeBtn = document.getElementById('theme-toggle');
      const currentTheme = document.documentElement.getAttribute('data-theme');
      themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }

    prefersDarkScheme.addListener((e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
    });

    // ===== SISTEMA DE COMENTÁRIOS COM INTEGRAÇÃO DE LOGIN =====
    document.addEventListener('DOMContentLoaded', function() {
      loadTheme(); // Carrega o tema ao iniciar

      // Dados do usuário (simulados ou reais)
      const loggedInUser = window.loggedInUser || {
        isLoggedIn: false
      };

      // Configura o usuário atual
      let currentUser;
      let currentAvatar;
      
      if (loggedInUser.isLoggedIn) {
        currentUser = loggedInUser.nickname;
        currentAvatar = loggedInUser.avatar;
      } else {
        currentUser = `Usuário_${Math.floor(Math.random() * 1000)}`;
        currentAvatar = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
      }

      const commentsList = document.getElementById('comments-list');
      const mainCommentInput = document.getElementById('main-comment');
      const submitBtn = document.getElementById('submit-comment');
      const commentsCount = document.querySelector('.comments-count');
      const reactionsCount = document.querySelector('.reactions-count');
      const emojiBtns = document.querySelectorAll('.emoji-btn');
      const formatBtns = document.querySelectorAll('.format-btn');
      const themeToggle = document.getElementById('theme-toggle');
      
      let comments = [];
      
      // Sistema de reações global
      let globalReactions = {
        "👍": { count: 0, users: new Set() },
        "❤️": { count: 0, users: new Set() },
        "😂": { count: 0, users: new Set() },
        "😮": { count: 0, users: new Set() },
        "😢": { count: 0, users: new Set() },
        "😠": { count: 0, users: new Set() }
      };

      function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} h atrás`;
        
        const days = Math.floor(hours / 24);
        return `${days} dia${days !== 1 ? 's' : ''} atrás`;
      }

      function createCommentElement(comment, isReply = false) {
        const commentWrapper = document.createElement('div');
        commentWrapper.className = 'comment';
        commentWrapper.dataset.id = comment.id;

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'comment-content-wrapper';

        const commentMain = document.createElement('div');
        commentMain.className = 'comment-main';
        
        let processedText = comment.text
          .replace(/<span class="spoiler">(.*?)<\/span>/g, 
            '<span class="spoiler" onclick="toggleSpoiler(this)">$1</span>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        commentMain.innerHTML = `
          <img src="${comment.avatar}" class="comment-avatar">
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${comment.author}
                ${comment.isLoggedInUser ? '<span class="verified-badge">✓</span>' : ''}
              </span>
              <span class="comment-time">${comment.time}</span>
            </div>
            <div class="comment-text">${processedText}</div>
            
            <div class="comment-actions">
              <button class="action-btn reply-btn">Responder</button>
              ${comment.author === currentUser ? ` 
                <button class="action-btn edit-btn">Editar</button>
                <button class="action-btn delete-btn">Excluir</button>
              ` : ''}
            </div>
          </div>
        `;

        contentWrapper.appendChild(commentMain);

        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.innerHTML = `
          <textarea class="comment-input reply-input" placeholder="Escreva sua resposta..."></textarea>
          <div class="form-actions">
            <div class="formatting-tools">
              <button class="format-btn" data-tag="spoiler">Spoiler</button>
              <button class="format-btn" data-tag="bold">Negrito</button>
            </div>
            <button class="submit-btn reply-submit">Responder</button>
            <button class="cancel-btn reply-cancel">Cancelar</button>
          </div>
        `;
        contentWrapper.appendChild(replyForm);

        if (comment.replies && comment.replies.length > 0) {
          const repliesContainer = document.createElement('div');
          repliesContainer.className = 'replies';
          comment.replies.forEach(reply => {
            repliesContainer.appendChild(createCommentElement(reply, true));
          });
          contentWrapper.appendChild(repliesContainer);
        }

        const editForm = document.createElement('div');
        editForm.className = 'edit-form';
        editForm.innerHTML = `
          <textarea class="edit-textarea">${comment.text.replace(/<span class="spoiler">(.*?)<\/span>/g, '$1').replace(/\*\*(.*?)\*\*/g, '$1')}</textarea>
          <div class="edit-buttons">
            <button class="edit-btn cancel-btn">Cancelar</button>
            <button class="edit-btn save-btn">Salvar</button>
          </div>
        `;
        contentWrapper.appendChild(editForm);

        commentWrapper.appendChild(contentWrapper);

        // Adiciona eventos para ações
        const replyBtn = commentWrapper.querySelector('.reply-btn');
        const replyFormElement = commentWrapper.querySelector('.reply-form');
        const replyTextarea = commentWrapper.querySelector('.reply-input');
        const replySubmit = commentWrapper.querySelector('.reply-submit');
        const replyCancel = commentWrapper.querySelector('.reply-cancel');
        const replyFormatBtns = commentWrapper.querySelectorAll('.format-btn');
        
        const editBtn = commentWrapper.querySelector('.edit-btn');
        const deleteBtn = commentWrapper.querySelector('.delete-btn');
        const editTextarea = commentWrapper.querySelector('.edit-textarea');
        const saveBtn = commentWrapper.querySelector('.save-btn');
        const cancelBtn = commentWrapper.querySelector('.cancel-btn');

        // Formatação na resposta
        replyFormatBtns.forEach(btn => {
          btn.addEventListener('click', function() {
            formatText(replyTextarea, this.dataset.tag);
          });
        });

        // Exibe/oculta o formulário de resposta
        replyBtn?.addEventListener('click', () => {
          replyFormElement.style.display = replyFormElement.style.display === 'block' ? 'none' : 'block';
          if (replyFormElement.style.display === 'block') {
            replyTextarea.focus();
          }
        });

        replySubmit?.addEventListener('click', () => {
          const replyText = replyTextarea.value.trim();
          if (replyText) {
            addReply(comment.id, replyText);
            replyFormElement.style.display = 'none';
            replyTextarea.value = '';
          }
        });

        replyCancel?.addEventListener('click', () => {
          replyFormElement.style.display = 'none';
          replyTextarea.value = '';
        });

        // Edição
        editBtn?.addEventListener('click', () => {
          editForm.style.display = 'block';
          commentMain.querySelector('.comment-text').style.display = 'none';
        });

        saveBtn?.addEventListener('click', () => {
          const newText = editTextarea.value.trim();
          if (newText) {
            updateComment(comment.id, newText);
            editForm.style.display = 'none';
            commentMain.querySelector('.comment-text').style.display = 'block';
          }
        });

        cancelBtn?.addEventListener('click', () => {
          editForm.style.display = 'none';
          commentMain.querySelector('.comment-text').style.display = 'block';
        });

        // Exclusão
        deleteBtn?.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja excluir este comentário?')) {
            deleteComment(comment.id);
          }
        });

        return commentWrapper;
      }

      // Função para formatar texto
      function formatText(textarea, tag) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText = '';
        
        switch(tag) {
          case 'spoiler':
            newText = selectedText ? `<span class="spoiler">${selectedText}</span>` : '<span class="spoiler">spoiler</span>';
            break;
          case 'bold':
            newText = selectedText ? `**${selectedText}**` : '**negrito**';
            break;
        }
        
        textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        textarea.focus();
      }

      // Funções CRUD para comentários
      function addComment(text) {
        const newComment = {
          id: Date.now(),
          author: currentUser,
          avatar: currentAvatar,
          text: text,
          time: formatDate(new Date()),
          replies: [],
          isLoggedInUser: loggedInUser.isLoggedIn
        };

        comments.unshift(newComment);
        updateCommentsUI();
      }

      function updateComment(id, newText) {
        const comment = findComment(comments, id);
        if (comment) {
          comment.text = newText;
          comment.time = formatDate(new Date());
          updateCommentsUI();
        }
      }

      function deleteComment(id) {
        comments = comments.filter(c => c.id !== id);
        updateCommentsUI();
      }

      function addReply(parentId, text) {
        const parentComment = findComment(comments, parentId);
        if (parentComment) {
          const newReply = {
            id: Date.now(),
            author: currentUser,
            avatar: currentAvatar,
            text: text,
            time: formatDate(new Date()),
            replies: [],
            isLoggedInUser: loggedInUser.isLoggedIn
          };

          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.unshift(newReply);
          updateCommentsUI();
        }
      }

      // Função para lidar com reações globais
      function handleReaction(emoji) {
        const reaction = globalReactions[emoji];
        
        // Se o usuário já reagiu com este emoji, remove a reação
        if (reaction.users.has(currentUser)) {
          reaction.count--;
          reaction.users.delete(currentUser);
        } 
        // Se o usuário já reagiu com outro emoji, troca a reação
        else {
          // Remove de qualquer outra reação existente
          Object.values(globalReactions).forEach(r => {
            if (r.users.has(currentUser)) {
              r.count--;
              r.users.delete(currentUser);
            }
          });
          
          // Adiciona a nova reação
          reaction.count++;
          reaction.users.add(currentUser);
        }
        
        updateReactionsUI();
        
        // Feedback visual
        emojiBtns.forEach(b => b.classList.remove('selected'));
        if (reaction.users.has(currentUser)) {
          document.querySelector(`.emoji-btn[data-emoji="${emoji}"]`).classList.add('selected');
        }
      }

      // Funções auxiliares
      function findComment(commentList, id) {
        for (const comment of commentList) {
          if (comment.id === id) return comment;
          if (comment.replies) {
            const found = findComment(comment.replies, id);
            if (found) return found;
          }
        }
        return null;
      }

      function updateCommentsUI() {
        renderComments();
        updateCommentsCount();
      }

      function updateReactionsUI() {
        const totalReactions = Object.values(globalReactions).reduce((sum, r) => sum + r.count, 0);
        reactionsCount.textContent = `${totalReactions} reação${totalReactions !== 1 ? 'ões' : ''}`;
      }

      function renderComments() {
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
          commentsList.innerHTML = '<p style="text-align: center; color: var(--secondary-text);">Nenhum comentário ainda. Seja o primeiro!</p>';
          return;
        }
        
        comments.forEach(comment => {
          commentsList.appendChild(createCommentElement(comment));
        });
      }

      function updateCommentsCount() {
        let totalComments = comments.length;
        comments.forEach(comment => {
          if (comment.replies) {
            totalComments += comment.replies.length;
          }
        });
        commentsCount.textContent = `${totalComments} Comentário${totalComments !== 1 ? 's' : ''}`;
      }

      // Event listeners
      submitBtn.addEventListener('click', () => {
        const text = mainCommentInput.value.trim();
        if (text) {
          addComment(text);
          mainCommentInput.value = '';
        }
      });

      emojiBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const emoji = this.dataset.emoji;
          handleReaction(emoji);
        });
      });

      formatBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          formatText(mainCommentInput, this.dataset.tag);
        });
      });

      themeToggle.addEventListener('click', toggleTheme);

      // Função global para spoilers
      window.toggleSpoiler = function(element) {
        element.classList.toggle('revealed');
      };

      // Inicialização
      updateCommentsUI();
      updateReactionsUI();
    });