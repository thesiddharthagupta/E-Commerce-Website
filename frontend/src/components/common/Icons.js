import React from 'react';
import { 
  Search, ShoppingCart, Heart, User, Menu, X, 
  ChevronDown as LucideChevronDown, 
  ChevronRight as LucideChevronRight, 
  Star, Truck, Shield, RefreshCcw, Phone, Mail, 
  MapPin, Package, Settings, LayoutGrid, List, 
  Filter, Edit, Trash2, Eye, Plus, Check, Home, 
  LogOut, ArrowRight, Tag, Bell, Image as LucideImage, 
  Upload, MessageSquare, Layers 
} from 'lucide-react';

// Common wrapper for compatibility if needed, though Lucide already accepts these props
const wrap = (Icon, defaultSize = 20) => (props) => (
  <Icon 
    size={props.size || defaultSize} 
    color={props.stroke || 'currentColor'} 
    strokeWidth={props.strokeWidth || 1.8}
    {...props} 
  />
);

export const SearchIcon     = wrap(Search, 18);
export const CartIcon       = wrap(ShoppingCart, 20);
export const HeartIcon      = wrap(Heart, 20);
export const UserIcon       = wrap(User, 20);
export const MenuIcon       = wrap(Menu, 22);
export const CloseIcon      = wrap(X, 20);
export const ChevronDown    = wrap(LucideChevronDown, 16);
export const ChevronRight   = wrap(LucideChevronRight, 16);
export const TruckIcon      = wrap(Truck, 18);
export const ShieldIcon     = wrap(Shield, 18);
export const RefreshIcon    = wrap(RefreshCcw, 18);
export const PhoneIcon      = wrap(Phone, 18);
export const MailIcon       = wrap(Mail, 18);
export const MapPinIcon     = wrap(MapPin, 18);
export const PackageIcon    = wrap(Package, 18);
export const SettingsIcon   = wrap(Settings, 18);
export const GridIcon       = wrap(LayoutGrid, 18);
export const ListIcon       = wrap(List, 18);
export const FilterIcon     = wrap(Filter, 18);
export const EditIcon       = wrap(Edit, 16);
export const TrashIcon      = wrap(Trash2, 16);
export const EyeIcon        = wrap(Eye, 16);
export const PlusIcon       = wrap(Plus, 18);
export const CheckIcon      = wrap(Check, 18);
export const HomeIcon       = wrap(Home, 18);
export const LogOutIcon     = wrap(LogOut, 18);
export const ArrowRightIcon = wrap(ArrowRight, 18);
export const TagIcon        = wrap(Tag, 18);
export const BellIcon       = wrap(Bell, 18);
export const ImageIcon      = wrap(LucideImage, 18);
export const UploadIcon     = wrap(Upload, 18);
export const MessageIcon    = wrap(MessageSquare, 18);
export const LayersIcon     = wrap(Layers, 18);

// Special case for StarIcon which has a custom 'filled' prop in our app
export const StarIcon = ({ filled, ...props }) => (
  <Star 
    size={props.size || 16} 
    color={props.stroke || (filled ? '#f59e0b' : 'currentColor')}
    fill={filled ? '#f59e0b' : (props.fill || 'none')}
    strokeWidth={props.strokeWidth || 1.8}
    {...props} 
  />
);
