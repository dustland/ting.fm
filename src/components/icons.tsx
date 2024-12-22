import {
  Play,
  Pause,
  Loader2,
  Settings,
  Home,
  Plus,
  Sparkles,
  Wand2,
  type LucideIcon,
  Radio,
  Compass,
  Upload,
  Link,
  FileText,
  Headphones,
  Share2,
  Edit,
  Trash2,
  Menu,
  X,
  Check,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  Mic,
  Save,
  Globe,
  Bot,
  Speaker,
  Users,
  ChevronRight,
  Volume2,
  Square,
  Webhook,
  Calendar,
  Sun,
  Moon,
  Laptop,
  LogOut,
  GraduationCap,
  Search,
  ExternalLink,
  Book,
  User,
  File,
  ScrollText,
  Tag,
  Paperclip,
  Info,
  Monitor,
  LucideProps,
  LetterText,
  FileUp,
} from "lucide-react";

export type Icon = LucideIcon;

export function google({ ...props }: any) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

export function arxiv({ ...props }: any) {
  return (
    <svg {...props} viewBox="0 0 135.611 201" fill="currentColor" stroke="none">
      <g>
        <path
          d="M456.756,249.1l-42.324,49.375c-1.885,2.01-3.054,5.535-2,8.066a6.9,6.9,0,0,0,6.443,4.27c1.6,0,2.911-.56,4.631-2.289l52.364-54.278a8.927,8.927,0,0,0,.061-12.584Z"
          transform="translate(-391.029 -166.577)"
        />
        <path d="M455.876,248.071l39.168-49.545c2.186-2.914,3.219-4.44,2.186-6.921a7.536,7.536,0,0,0-6.566-4.633h0a5.9,5.9,0,0,0-4.408,1.624l-50.072,53.061c-3.816,3.816-3.808,8.753.023,12.584l70.031,73.438a5.738,5.738,0,0,0,4.6,1.748c2.833,0,4.67-1.667,5.9-4.131,1.054-2.531-.112-5.038-2.056-7.664l-58.8-69.561" />
        <path d="M475.931,241.657l-68.388-71.966s-2.511-3.048-5.165-3.112a6.75,6.75,0,0,0-6.357,4.084c-1.033,2.481-.291,4.223,1.977,7.47L456.756,249.1Z" />
      </g>
    </svg>
  );
}

export const Icons = {
  logo: Radio,
  home: Home,
  create: Plus,
  discover: Compass,
  upload: Upload,
  link: Link,
  globe: Globe,
  fileup: FileUp,
  text: LetterText,
  channel: Radio,
  podcast: Headphones,
  play: Play,
  pause: Pause,
  share: Share2,
  edit: Edit,
  delete: Trash2,
  settings: Settings,
  menu: Menu,
  close: X,
  wand: Wand2,
  spinner: Loader2,
  check: Check,
  warning: AlertTriangle,
  error: AlertOctagon,
  success: CheckCircle,
  clock: Clock,
  audio: Mic,
  plus: Plus,
  trash: Trash2,
  save: Save,
  bot: Bot,
  speaker: Speaker,
  users: Users,
  chevronRight: ChevronRight,
  volume2: Volume2,
  square: Square,
  sparkles: Sparkles,
  webhook: Webhook,
  calendar: Calendar,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  logout: LogOut,
  graduationCap: GraduationCap,
  fileText: FileText,
  radio: Radio,
  search: Search,
  google,
  arxiv,
  user: User,
  file: File,
  externalLink: ExternalLink,
  documentText: ScrollText,
  paperclip: Paperclip,
  tag: Tag,
  book: Book,
  info: Info,
  display: Monitor,
} as const;
