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
  Download,
  ChevronLeft,
  Rewind,
  FastForward,
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
    <svg
      {...props}
      id="logomark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 17.732 24.269"
    >
      <g id="tiny">
        <path
          d="M573.549,280.916l2.266,2.738,6.674-7.84c.353-.47.52-.717.353-1.117a1.218,1.218,0,0,0-1.061-.748h0a.953.953,0,0,0-.712.262Z"
          transform="translate(-566.984 -271.548)"
          fill="#bdb9b4"
        />
        <path
          d="M579.525,282.225l-10.606-10.174a1.413,1.413,0,0,0-.834-.5,1.09,1.09,0,0,0-1.027.66c-.167.4-.047.681.319,1.206l8.44,10.242h0l-6.282,7.716a1.336,1.336,0,0,0-.323,1.3,1.114,1.114,0,0,0,1.04.69A.992.992,0,0,0,571,293l8.519-7.92A1.924,1.924,0,0,0,579.525,282.225Z"
          transform="translate(-566.984 -271.548)"
          fill="#b31b1b"
        />
        <path
          d="M584.32,293.912l-8.525-10.275,0,0L573.53,280.9l-1.389,1.254a2.063,2.063,0,0,0,0,2.965l10.812,10.419a.925.925,0,0,0,.742.282,1.039,1.039,0,0,0,.953-.667A1.261,1.261,0,0,0,584.32,293.912Z"
          transform="translate(-566.984 -271.548)"
          fill="#bdb9b4"
        />
      </g>
    </svg>
  );
}

export const Icons = {
  logo: Radio,
  home: Home,
  create: Plus,
  discover: Compass,
  download: Download,
  headphones: Headphones,
  upload: Upload,
  link: Link,
  globe: Globe,
  fileup: FileUp,
  text: LetterText,
  channel: Radio,
  podcast: Headphones,
  play: Play,
  pause: Pause,
  rewind: Rewind,
  fastForward: FastForward,
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
  chevronLeft: ChevronLeft,
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
  x: X,
  user: User,
  file: File,
  externalLink: ExternalLink,
  documentText: ScrollText,
  paperclip: Paperclip,
  tag: Tag,
  book: Book,
  info: Info,
  display: Monitor,
  publish: Share2,
} as const;
