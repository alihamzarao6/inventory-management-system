export interface BaseLocation {
    id: string;
    name: string;
    image: string;
    type: 'warehouse' | 'store';
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    note?: string;
}

export interface SubLocation extends BaseLocation {
    parentId: string;
}

export interface Location extends BaseLocation {
    type: 'warehouse' | 'store';
    subLocations: SubLocation[];
}