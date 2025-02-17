import { useState } from "react";

const EmojiPicker = ({ selectionHandler }) => {
  const [selectedCategory, setSelectedCategory] = useState("smileys");

  const emojiCategories = {
    smileys: {
      name: "Smileys & Emotion",
      icon: "😊",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
      ],
    },
    people: {
      name: "People & Body",
      icon: "👋",
      emojis: [
        "👋",
        "🤚",
        "🖐️",
        "✋",
        "🖖",
        "👌",
        "🤏",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "🖕",
        "👇",
        "👍",
        "👎",
        "✊",
        "👊",
        "🤛",
        "🤜",
      ],
    },
    nature: {
      name: "Animals & Nature",
      icon: "🌸",
      emojis: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐸",
        "🐵",
        "🌸",
        "🌹",
        "🌺",
        "🌻",
        "🌼",
        "🌷",
        "🌱",
        "🌲",
        "🌳",
        "🌴",
      ],
    },
    food: {
      name: "Food & Drink",
      icon: "🍔",
      emojis: [
        "🍏",
        "🍎",
        "🍐",
        "🍊",
        "🍋",
        "🍌",
        "🍉",
        "🍇",
        "🍓",
        "🫐",
        "🍈",
        "🍒",
        "🍑",
        "🥭",
        "🍍",
        "🥥",
        "🥝",
        "🍅",
        "🍆",
        "🥑",
        "🥦",
        "🥬",
        "🥒",
        "🌶️",
        "🫑",
      ],
    },
    activities: {
      name: "Activities",
      icon: "⚽",
      emojis: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🪀",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🪃",
        "🥅",
        "⛳",
        "🪁",
        "🏹",
        "🎣",
        "🤿",
        "🥊",
      ],
    },
    travel: {
      name: "Travel & Places",
      icon: "✈️",
      emojis: [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🛻",
        "🚚",
        "🚛",
        "🚜",
        "🛵",
        "🏍️",
        "🛺",
        "🚲",
        "🛴",
        "🚨",
        "🚔",
        "🚍",
        "🚘",
        "🚖",
        "✈️",
      ],
    },
    objects: {
      name: "Objects",
      icon: "💡",
      emojis: [
        "⌚",
        "📱",
        "📲",
        "💻",
        "⌨️",
        "🖥️",
        "🖨️",
        "🖱️",
        "🖲️",
        "🕹️",
        "🗜️",
        "💽",
        "💾",
        "💿",
        "📀",
        "📼",
        "📷",
        "📸",
        "📹",
        "🎥",
        "📽️",
        "🎞️",
        "📞",
        "☎️",
        "📟",
      ],
    },
    symbols: {
      name: "Symbols",
      icon: "❤️",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉️",
      ],
    },
  };

  return (
    <div className="w-60 md:w-80 bg-background text-text-primary rounded-lg shadow-lg pb-1 overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-thin gap-2 scrollbar-hide border-b border-border p-1 ">
        {console.log(Object.values(emojiCategories))}
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSelectedCategory(key);
            }}
            className={`flex items-center gap-2 p-1 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === key ? "bg-accent/25" : " bg-transparent"
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            {/* <span className="text-sm font-medium">{category.name}</span> */}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 md:grid-cols-8 gap-2 p-1 max-h-40 overflow-y-auto scrollbar-thin">
        {emojiCategories[selectedCategory].emojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => selectionHandler(emoji)}
            className="icon-button text-sm md:text-lg bg-transparent hover:bg-accent/25 rounded-lg transition-all duration-200 hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
