//  FIX MOJIBAKE AND ADD SIMPLE EMOJIS =====
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixMojibake);
  } else {
    fixMojibake();
  }
  
  function fixMojibake() {
    console.log('🔧 Fixing mojibake characters...');
    
    // Common mojibake patterns and their correct emoji replacements
    const replacements = {
      // ToolKit mojibakes
      'ðŸŽ¯': '🎯',
      'ðŸ¤': '🤝',
      'âœ…': '✅',
      'ðŸ“Š': '📊',
      'ðŸš¨': '🚨',
      'ðŸ†': '🏆',
      'ðŸ“': '📝',
      'ðŸ“Œ': '📌',
      
      // Common mojibakes
      'ðŸ“¢': '📢',
      'ðŸ“š': '📚',
      'ðŸ“': '📁',
      'ðŸ—³️': '🗳️',
      'ðŸ‘¥': '👥',
      'ðŸ“ˆ': '📈',
      'âš™ï¸': '⚙️',
      'ðŸ“': '📝',
      'ðŸ“‹': '📋',
      'ðŸ“Š': '📊',
      'ðŸ“‰': '📉',
      'ðŸ“Œ': '📌',
      'ðŸ“Ž': '📍',
      'ðŸ“': '🔖',
      'ðŸ“': '📐',
      'ðŸ“‘': '📑',
      'ðŸ“’': '📒',
      'ðŸ““': '📓',
      'ðŸ“”': '📔',
      'ðŸ“•': '📕',
      'ðŸ“–': '📖',
      'ðŸ“—': '📗',
      'ðŸ“˜': '📘',
      'ðŸ“™': '📙',
      
      // Arrows and symbols
      'â†': '←',
      'â†’': '→',
      'â†‘': '↑',
      'â†“': '↓',
      'âœ”ï¸': '✔️',
      'âœ–ï¸': '✖️',
      'âŒ': '❌',
      'âœ…': '✅',
      'âš ï¸': '⚠️',
      'â„¹ï¸': 'ℹ️',
      
      // Additional teacher toolkit mojibakes
      'ðŸŽ¯': '🎯', // Instant Student Picker
      'ðŸ¤': '🤝', // Group Generator
      'ðŸ“Š': '📊', // Class Pulse
      'ðŸš¨': '🚨', // At-Risk Outreach
      'ðŸ†': '🏆', // Weekly Wins
      'ðŸ“': '📝', // Quick Notes
      'ðŸ“Œ': '📌', // Priority List
      
      // Check-in emojis
      'ðŸ˜Š': '😊',
      'ðŸ˜': '😐',
      'ðŸ˜•': '😕',
      
      // Numbers
      'ðŸ‘Ž': '👍',
      'ðŸ‘': '👎',
      'ðŸ‘': '👏',
      'ðŸ™Œ': '🙌',
      
      // Time
      'ðŸ•’': '🕒',
      'ðŸ•': '🕐',
      'ðŸ•‘': '🕑',
      
      // Miscellaneous
      'ðŸ”—': '🔔',
      'ðŸ“³': '📳',
      'ðŸ“±': '📱',
      'ðŸ’»': '💻',
      'ðŸ–¥ï¸': '🖥️',
      'ðŸ–¨ï¸': '🖨️',
      'ðŸ“¸': '📸',
      'ðŸ“º': '📺',
      'ðŸ“»': '📻',
      
      // Weather
      'â˜€ï¸': '☀️',
      'â˜ï¸': '☁️',
      'â˜”ï¸': '☔',
      'âš¡': '⚡',
      
      // Hearts
      'â¤ï¸': '❤️',
      'ðŸ’™': '💙',
      'ðŸ’š': '💚',
      'ðŸ’›': '💛',
      'ðŸ’œ': '💜',
      
      // Food
      'ðŸŽ': '🍎',
      'ðŸŒ': '🍌',
      'ðŸ“': '🍓',
      'ðŸ‰': '🍉',
      'ðŸ”': '🍔',
      'ðŸ•': '🍕',
      'ðŸº': '🍺',
      'ðŸ·': '🍷',
      
      // Animals
      'ðŸ¶': '🐶',
      'ðŸ±': '🐱',
      'ðŸ­': '🐭',
      'ðŸ¹': '🐹',
      'ðŸ°': '🐰',
      'ðŸ¦Š': '🦊',
      'ðŸ¾': '🐾',
      'ðŸ¦': '🦁',
      'ðŸ¨': '🐨',
      'ðŸ¼': '🐼',
      
      // Sports
      'âš½': '⚽',
      'âš¾': '⚾',
      'â€': '🏀',
      'ðŸ€': '🏀',
      'ðŸ': '🏐',
      'ðŸˆ': '🏈',
      'ðŸ‰': '🏉',
      'ðŸŽ¾': '🎾',
      'ðŸŽ½': '🎽',
      'ðŸŽ¯': '🎯',
      
      // Flags
      'ðŸ‡ºðŸ‡¸': '🇺🇸',
      'ðŸ‡¬ðŸ‡§': '🇬🇧',
      'ðŸ‡«ðŸ‡·': '🇫🇷',
      'ðŸ‡©ðŸ‡ª': '🇩🇪',
      'ðŸ‡¯ðŸ‡µ': '🇯🇵',
      'ðŸ‡¨ðŸ‡³': '🇨🇳',
      'ðŸ‡®ðŸ‡¹': '🇮🇹',
      'ðŸ‡ªðŸ‡¸': '🇪🇸',
      
      // Celebration
      'ðŸŽ‰': '🎉',
      'ðŸŽŠ': '🎊',
      'ðŸŽˆ': '🎈',
      'ðŸŽ': '🎁',
      'ðŸŽ€': '🎀',
      'ðŸŽƒ': '🎃',
      'ðŸŽ„': '🎄',
      'ðŸŽ…': '🎅',
      'ðŸŽ†': '🎆',
      'ðŸŽ‡': '🎇',
      'ðŸŽŒ': '🎌',
      'ðŸŽ': '🎍',
      'ðŸŽŽ': '🎎',
      'ðŸŽ': '🎏',
      'ðŸŽ': '🎐',
      'ðŸŽ‘': '🎑',
      'ðŸŽ’': '🎒',
      'ðŸŽ“': '🎓',
      
      // Music
      'ðŸŽ¶': '🎶',
      'ðŸŽµ': '🎵',
      'ðŸŽ¤': '🎤',
      'ðŸŽ§': '🎧',
      'ðŸŽ¨': '🎨',
      'ðŸŽ­': '🎭',
      'ðŸŽ®': '🎮',
      'ðŸŽ¯': '🎯',
      'ðŸŽ°': '🎰',
      'ðŸŽ±': '🎱',
      'ðŸŽ²': '🎲',
      'ðŸŽ³': '🎳',
      'ðŸŽ´': '🎴',
      'ðŸŽµ': '🎵',
      'ðŸŽ¶': '🎶',
      
      // Travel
      'âœˆï¸': '✈️',
      'ðŸš—': '🚗',
      'ðŸš²': '🚲',
      'ðŸš…': '🚅',
      'ðŸšˆ': '🚈',
      'ðŸš': '🚐',
      'ðŸš‘': '🚑',
      'ðŸš’': '🚒',
      'ðŸš“': '🚓',
      'ðŸš”': '🚔',
      'ðŸš•': '🚕',
      'ðŸš–': '🚖',
      'ðŸš˜': '🚘',
      'ðŸš™': '🚙',
      'ðŸšš': '🚚',
      'ðŸš›': '🚛',
      'ðŸšœ': '🚜',
      
      // Moon phases
      'ðŸŒ‘': '🌑',
      'ðŸŒ’': '🌒',
      'ðŸŒ“': '🌓',
      'ðŸŒ”': '🌔',
      'ðŸŒ•': '🌕',
      'ðŸŒ–': '🌖',
      'ðŸŒ—': '🌗',
      'ðŸŒ˜': '🌘',
      'ðŸŒ™': '🌙',
      'ðŸŒš': '🌚',
      'ðŸŒ›': '🌛',
      'ðŸŒœ': '🌜',
      
      // Stars
      'â­': '⭐',
      'ðŸŒŸ': '🌟',
      'ðŸŒ ': '🌠',
      'ðŸŒŒ': '🌌',
      
      // Nature
      'ðŸŒ¿': '🌿',
      'ðŸ‚': '🍂',
      'ðŸƒ': '🍃',
      'ðŸ„': '🍄',
      'ðŸŒº': '🌺',
      'ðŸŒ»': '🌻',
      'ðŸŒ¼': '🌼',
      'ðŸŒ½': '🌽',
      'ðŸŒ¾': '🌾',
      
      // Faces
      'ðŸ˜€': '😀',
      'ðŸ˜ƒ': '😃',
      'ðŸ˜„': '😄',
      'ðŸ˜†': '😆',
      'ðŸ˜‰': '😉',
      'ðŸ˜Š': '😊',
      'ðŸ˜‹': '😋',
      'ðŸ˜Œ': '😌',
      'ðŸ˜': '😍',
      'ðŸ˜Ž': '😎',
      'ðŸ˜': '😏',
      'ðŸ˜': '😐',
      'ðŸ˜‘': '😑',
      'ðŸ˜’': '😒',
      'ðŸ˜“': '😓',
      'ðŸ˜”': '😔',
      'ðŸ˜•': '😕',
      'ðŸ˜–': '😖',
      'ðŸ˜—': '😗',
      'ðŸ˜˜': '😘',
      'ðŸ˜™': '😙',
      'ðŸ˜š': '😚',
      'ðŸ˜›': '😛',
      'ðŸ˜œ': '😜',
      'ðŸ˜': '😝',
      'ðŸ˜ž': '😞',
      'ðŸ˜Ÿ': '😟',
      'ðŸ˜ ': '😠',
      'ðŸ˜¡': '😡',
      'ðŸ˜¢': '😢',
      'ðŸ˜£': '😣',
      'ðŸ˜¤': '😤',
      'ðŸ˜¥': '😥',
      'ðŸ˜¦': '😦',
      'ðŸ˜§': '😧',
      'ðŸ˜¨': '😨',
      'ðŸ˜©': '😩',
      'ðŸ˜ª': '😪',
      'ðŸ˜«': '😫',
      'ðŸ˜¬': '😬',
      'ðŸ˜­': '😭',
      'ðŸ˜®': '😮',
      'ðŸ˜¯': '😯',
      'ðŸ˜°': '😰',
      'ðŸ˜±': '😱',
      'ðŸ˜²': '😲',
      'ðŸ˜³': '😳',
      'ðŸ˜´': '😴',
      'ðŸ˜µ': '😵',
      'ðŸ˜¶': '😶',
      'ðŸ˜·': '😷',
      'ðŸ˜¸': '😸',
      'ðŸ˜¹': '😹',
      'ðŸ˜º': '😺',
      'ðŸ˜»': '😻',
      'ðŸ˜¼': '😼',
      'ðŸ˜½': '😽',
      'ðŸ˜¾': '😾',
      'ðŸ˜¿': '😿',
      'ðŸ™€': '🙀',
      'ðŸ™': '🙁',
      'ðŸ™‚': '🙂',
      'ðŸ™ƒ': '🙃',
      'ðŸ™„': '🙄',
      'ðŸ™…': '🙅',
      'ðŸ™†': '🙆',
      'ðŸ™‡': '🙇',
      'ðŸ™ˆ': '🙈',
      'ðŸ™‰': '🙉',
      'ðŸ™Š': '🙊',
      'ðŸ™‹': '🙋',
      'ðŸ™Œ': '🙌',
      'ðŸ™': '🙍',
      'ðŸ™Ž': '🙎',
      'ðŸ™': '🙏'
    };
    
    // Function to replace text in an element
    function replaceTextInElement(element) {
      if (element.nodeType === Node.TEXT_NODE) {
        let text = element.nodeValue;
        let modified = false;
        
        // Replace each mojibake pattern
        for (const [bad, good] of Object.entries(replacements)) {
          if (text.includes(bad)) {
            text = text.split(bad).join(good);
            modified = true;
          }
        }
        
        if (modified) {
          element.nodeValue = text;
        }
      } else if (element.nodeType === Node.ELEMENT_NODE && 
                 !['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE'].includes(element.tagName)) {
        // Process child nodes
        element.childNodes.forEach(child => replaceTextInElement(child));
        
        // Also check attributes that might contain text
        if (element.placeholder) {
          for (const [bad, good] of Object.entries(replacements)) {
            if (element.placeholder.includes(bad)) {
              element.placeholder = element.placeholder.split(bad).join(good);
            }
          }
        }
        
        if (element.value && element.tagName === 'INPUT' && element.type === 'text') {
          for (const [bad, good] of Object.entries(replacements)) {
            if (element.value.includes(bad)) {
              element.value = element.value.split(bad).join(good);
            }
          }
        }
      }
    }
    
    // Start from body
    replaceTextInElement(document.body);
    
    // Also fix title
    if (document.title) {
      for (const [bad, good] of Object.entries(replacements)) {
        if (document.title.includes(bad)) {
          document.title = document.title.split(bad).join(good);
        }
      }
    }
    
    console.log('✅ Mojibake fixed!');
    
    // Add mutation observer for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              replaceTextInElement(node);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();