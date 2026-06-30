import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeAppearance } from '../contexts/themeHelpers';

const OPTIONS: { value: ThemeAppearance; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: '浅色' },
  { value: 'dark', icon: Moon, label: '深色' },
  { value: 'system', icon: Monitor, label: '跟随系统' },
];

function ThemeSwitcher() {
  const { appearance, setAppearance } = useTheme();

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="主题模式">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = appearance === option.value;

        return (
          <button
            key={option.value}
            className={`theme-option ${active ? 'theme-option-active' : ''}`}
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            onClick={() => setAppearance(option.value)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSwitcher;
