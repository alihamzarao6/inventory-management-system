export interface BaseLocation {
    id: string;
    name: string;
    image: string;
    type: 'Warehouse' | 'Store';
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
    type: 'Warehouse' | 'Store';
    subLocations: SubLocation[];
}