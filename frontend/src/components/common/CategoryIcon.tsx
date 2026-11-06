import React from "react";
import {
    Film,
    ShoppingBag,
    ShoppingCart,
    Landmark,
    PiggyBank,
    TrendingUp,
    Wifi,
    MapPin,
    GraduationCap,
    Activity,
    Fuel,
    Zap,
    Wallet,
    Home,
    Coffee,
    Coins,
    Briefcase,
    Bike,
    Car,
    Bus,
    Plane,
    Pizza,
    Droplets,
    Flame,
    Phone,
    BookOpen,
    Building2,
    UserPlus,
    Gamepad2,
    Music,
    ShieldCheck,
    Receipt,
    Gift,
    Heart,
    PawPrint,
    Wrench,
    Building,
    Scissors,
    CalendarCheck,
    Tag,
    type LucideIcon,
} from "lucide-react";

interface CategoryIconProps {
    icon?: string;
    categoryName?: string;
    type?: string;
    size?: number;
    className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
    film: Film,
    movie: Film,
    bag: ShoppingBag,
    basket: ShoppingCart,
    basket2: ShoppingCart,
    grocery: ShoppingCart,
    groceries: ShoppingCart,
    bank: Landmark,
    "piggy-bank": PiggyBank,
    savings: PiggyBank,
    "graph-up": TrendingUp,
    "graph-up-arrow": TrendingUp,
    investment: TrendingUp,
    wifi: Wifi,
    "geo-alt": MapPin,
    travel: MapPin,
    mortarboard: GraduationCap,
    education: GraduationCap,
    "heart-pulse": Activity,
    medical: Activity,
    "fuel-pump": Fuel,
    petrol: Fuel,
    fuel: Fuel,
    "lightning-charge": Zap,
    electricity: Zap,
    wallet2: Wallet,
    wallet: Wallet,
    salary: Wallet,
    house: Home,
    rent: Home,
    home: Home,
    "cup-hot": Coffee,
    food: Coffee,
    restaurant: Coffee,
    "cash-coin": Coins,
    "cash-stack": Coins,
    coins: Coins,
    briefcase: Briefcase,
    business: Briefcase,
    freelance: Briefcase,
    bicycle: Bike,
    bike: Bike,
    "car-front": Car,
    car: Car,
    "bus-front": Bus,
    bus: Bus,
    airplane: Plane,
    flight: Plane,
    pizza: Pizza,
    droplet: Droplets,
    water: Droplets,
    fire: Flame,
    gas: Flame,
    phone: Phone,
    mobile: Phone,
    book: BookOpen,
    "journal-bookmark": BookOpen,
    hospital: Building2,
    "person-plus": UserPlus,
    activity: Activity,
    gym: Activity,
    controller: Gamepad2,
    gaming: Gamepad2,
    "music-note": Music,
    music: Music,
    "shield-check": ShieldCheck,
    insurance: ShieldCheck,
    receipt: Receipt,
    bill: Receipt,
    gift: Gift,
    heart: Heart,
    charity: Heart,
    paw: PawPrint,
    pet: PawPrint,
    tools: Wrench,
    maintenance: Wrench,
    building: Building,
    hotel: Building,
    scissors: Scissors,
    salon: Scissors,
    "calendar-check": CalendarCheck,
    subscription: CalendarCheck,
};

const getCategoryIconComponent = (
    icon?: string,
    categoryName?: string,
    type?: string
): LucideIcon => {
    if (icon) {
        const match = icon.match(/\/icons\/([^/]+)\.svg/);
        const iconKey = (match ? match[1] : icon)
            .replace(/\.svg$/, "")
            .toLowerCase()
            .trim();

        if (ICON_MAP[iconKey]) {
            return ICON_MAP[iconKey];
        }
    }

    if (categoryName) {
        const lowerName = categoryName.toLowerCase().trim();
        for (const [key, IconComp] of Object.entries(ICON_MAP)) {
            if (lowerName.includes(key)) {
                return IconComp;
            }
        }
    }

    if (type === "income") return Wallet;
    if (type === "investment") return TrendingUp;
    if (type === "expense") return Receipt;
    return Tag;
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
    icon,
    categoryName,
    type,
    size = 18,
    className = "",
}) => {
    const IconComponent = getCategoryIconComponent(icon, categoryName, type);
    return React.createElement(IconComponent, {
        size,
        className: `category-lucide-icon ${className}`.trim(),
        style: { color: "#ffffff", strokeWidth: 2 },
    });
};

export default CategoryIcon;

