type HeaderProps = {
    title: string
    description?: string
    className?: string
}

interface MenuItem {
    title: string;
    icon: LucideIcon;
    href: string;
}

type Login = {
  email: string;
  password?: string; 
}

type RestaurantForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  cuisine?: string;
  description?: string;
}
