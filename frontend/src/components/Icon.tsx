import {
  PlusIcon,
  ArrowRightIcon,
  CakeIcon,
  PhoneIcon,
  XCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeModernIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  UserIcon,
  FunnelIcon,
  UsersIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  ArrowLeftOnRectangleIcon,
  MapIcon,
  PhotoIcon,
  ArrowPathIcon,
  EllipsisHorizontalCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

function PawSolidIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function PawOutlineIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  add: PlusIcon,
  arrow_forward: ArrowRightIcon,
  cake: CakeIcon,
  call: PhoneIcon,
  cancel: XCircleIcon,
  celebration: SparklesIcon,
  check_circle: CheckCircleIcon,
  check_circle_solid: CheckCircleSolidIcon,
  chevron_left: ChevronLeftIcon,
  chevron_right: ChevronRightIcon,
  dashboard: HomeModernIcon,
  description: DocumentTextIcon,
  download: ArrowDownTrayIcon,
  favorite: HeartIcon,
  favorite_solid: HeartSolidIcon,
  female: UserIcon,
  filter_list: FunnelIcon,
  group: UsersIcon,
  health_and_safety: ShieldCheckIcon,
  help: QuestionMarkCircleIcon,
  location: MapPinIcon,
  logout: ArrowLeftOnRectangleIcon,
  male: UserIcon,
  map: MapIcon,
  pets: PawOutlineIcon,
  pets_solid: PawSolidIcon,
  photo_library: PhotoIcon,
  progress_activity: ArrowPathIcon,
  radio_button_unchecked: EllipsisHorizontalCircleIcon,
  schedule: ClockIcon,
  search: MagnifyingGlassIcon,
  search_off: ExclamationTriangleIcon,
  share: ArrowUpTrayIcon,
  trending_up: ArrowTrendingUpIcon,
  visibility: EyeIcon,
  volunteer_activism: HandRaisedIcon,
};

interface IconProps {
  name: string;
  className?: string;
  solid?: boolean;
}

export default function Icon({ name, className = '', solid = false }: IconProps) {
  const solidKey = `${name}_solid`;
  const IconComponent = solid ? (iconMap[solidKey] || iconMap[name]) : iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
}
