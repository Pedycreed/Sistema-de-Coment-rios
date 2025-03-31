# Sistema de Comentários com Modo Claro/Escuro

![Preview do Sistema de Comentários](https://imgur.com/a/Hhu4Rjx)

Um sistema de comentários moderno com suporte a:
- Modo claro/escuro automático (baseado no sistema do usuário)
- Alternância manual de tema
- Integração com usuários logados
- Formatação de texto (spoiler, negrito)
- Respostas aninhadas
- Reações com emojis

## 🚀 Como Implementar no Seu Site

### 1. Estrutura Básica
Adicione este código no seu HTML onde deseja que os comentários apareçam:

```html
<div id="comments-container"></div>
<script src="caminho/para/comments.js"></script>
```

### 2. Integração com Login
Substitua o objeto `loggedInUser` pelos dados reais do seu sistema:

```javascript
// Para sistemas PHP (exemplo)
const loggedInUser = {
  isLoggedIn: <?php echo isset($_SESSION['user']) ? 'true' : 'false'; ?>,
  nickname: "<?php echo isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']['nickname']) : ''; ?>",
  avatar: "<?php echo isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']['avatar_url']) : ''; ?>"
};

// Para sistemas com API
fetch('/api/user')
  .then(response => response.json())
  .then(user => {
    window.loggedInUser = user;
  });
```

### 3. Personalização
Edite as variáveis CSS no início do arquivo para combinar com o design do seu site:

```css
:root {
  --primary-color: #2e9fff; /* Cor primária */
  --bg-color: #f5f5f5; /* Cor de fundo (claro) */
  --text-color: #333; /* Cor do texto (claro) */
}

[data-theme="dark"] {
  --primary-color: #3a9dff; /* Cor primária (escuro) */
  --bg-color: #121212; /* Cor de fundo (escuro) */
  --text-color: #e0e0e0; /* Cor do texto (escuro) */
}
```

## 🔧 Funcionalidades

| Recurso               | Descrição                                                                 |
|-----------------------|---------------------------------------------------------------------------|
| 🌗 Tema Automático    | Detecta o tema do sistema do usuário (claro/escuro)                       |
| 🎨 Tema Manual        | Botão para alternância manual com persistência                            |
| 👤 Usuários Logados   | Exibe avatar e nickname real para usuários autenticados                   |
| 💬 Comentários        | Sistema completo com formatação, respostas, edição e exclusão             |
| 👍 Reações            | Sistema de reações com emojis (👍, ❤️, 😂, etc)                          |
| 📱 Responsivo         | Design que se adapta a qualquer tamanho de tela                           |

## 📦 Estrutura de Arquivos

```
seu-site/
├── assets/
│   ├── css/
│   │   └── comments.css  # Estilos do sistema
│   └── js/
│       └── comments.js    # Lógica principal
├── index.html             # Onde o sistema será incluído
└── ...
```

## 📌 Dependências

- Nenhuma! Funciona com JavaScript puro (Vanilla JS)

## 🌟 Recursos Futuros

- [ ] Upload de imagens nos comentários
- [ ] Menção a outros usuários (@username)
- [ ] Moderação de comentários
- [ ] Tradução para múltiplos idiomas

## 📄 Licença

MIT License - Livre para uso e modificação

---

💡 **Dica**: Para uma implementação mais avançada, considere integrar com um backend para armazenar os comentários permanentemente.
