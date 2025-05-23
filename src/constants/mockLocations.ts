import { Location, SubLocation } from '@/types/locations';

export const MOCK_SUB_LOCATIONS: SubLocation[] = [
    // Sub Warehouses for Warehouse 1
    {
        id: 'sub-w1-1',
        parentId: '1',
        name: 'Sub Warehouse 1A',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w1a@example.com',
        phone: '+1234567890',
        address: '123-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w1-2',
        parentId: '1',
        name: 'Sub Warehouse 1B',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w1b@example.com',
        phone: '+1234567891',
        address: '123-B Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w1-3',
        parentId: '1',
        name: 'Sub Warehouse 1C',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w1a@example.com',
        phone: '+1234567890',
        address: '123-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w1-4',
        parentId: '1',
        name: 'Sub Warehouse 1D',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w1b@example.com',
        phone: '+1234567891',
        address: '123-B Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    // Sub Warehouses for Warehouse 2
    {
        id: 'sub-w2-1',
        parentId: '2',
        name: 'Sub Warehouse 2A',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w2a@example.com',
        phone: '+1234567892',
        address: '124-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w2-2',
        parentId: '2',
        name: 'Sub Warehouse 2B',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w2a@example.com',
        phone: '+1234567892',
        address: '124-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w3-1',
        parentId: '3',
        name: 'Sub Warehouse 3A',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w2a@example.com',
        phone: '+1234567892',
        address: '124-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    {
        id: 'sub-w3-2',
        parentId: '3',
        name: 'Sub Warehouse 3B',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        email: 'sub-w2a@example.com',
        phone: '+1234567892',
        address: '124-A Storage St',
        city: 'Warehouse City',
        country: 'Country',
        type: 'Warehouse'
    },
    // Sub Stores for Store 1
    {
        id: 'sub-s1-1',
        parentId: '4',
        name: 'Sub Store 1A',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1a@example.com',
        phone: '+1234567893',
        address: '125-A Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
    {
        id: 'sub-s1-2',
        parentId: '4',
        name: 'Sub Store 1B',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1b@example.com',
        phone: '+1234567894',
        address: '125-B Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
    {
        id: 'sub-s2-1',
        parentId: '5',
        name: 'Sub Store 2A',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1a@example.com',
        phone: '+1234567893',
        address: '125-A Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
    {
        id: 'sub-s2-2',
        parentId: '5',
        name: 'Sub Store 2B',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1b@example.com',
        phone: '+1234567894',
        address: '125-B Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
    {
        id: 'sub-s3-1',
        parentId: '6',
        name: 'Sub Store 3A',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1a@example.com',
        phone: '+1234567893',
        address: '125-A Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
    {
        id: 'sub-s3-2',
        parentId: '6',
        name: 'Sub Store 3B',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        email: 'sub-s1b@example.com',
        phone: '+1234567894',
        address: '125-B Retail St',
        city: 'Store City',
        country: 'Country',
        type: 'Store'
    },
];

export const MOCK_LOCATIONS: Location[] = [
    {
        id: '1',
        name: 'Warehouse 1',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        type: 'Warehouse',
        email: 'warehouse1@example.com',
        phone: '+1234567890',
        address: '123 Storage St',
        city: 'Warehouse City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '1'),
    },
    {
        id: '2',
        name: 'Warehouse 2',
        image: 'https://t3.ftcdn.net/jpg/02/89/33/26/360_F_289332658_UfLIT4XkakIiathb53ErZWfPsGX1GFpb.jpg',
        type: 'Warehouse',
        email: 'warehouse2@example.com',
        phone: '+1234567891',
        address: '124 Storage St',
        city: 'Warehouse City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '2'),
    },
    {
        id: '3',
        name: 'Warehouse 3',
        image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?cs=srgb&dl=pexels-tiger-lily-4483610.jpg&fm=jpg',
        type: 'Warehouse',
        email: 'warehouse2@example.com',
        phone: '+1234567891',
        address: '124 Storage St',
        city: 'Warehouse City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '3'),
    },
    {
        id: '4',
        name: 'Store 1',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        type: 'Store',
        email: 'store1@example.com',
        phone: '+1234567892',
        address: '125 Retail St',
        city: 'Store City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '4'),
    },
    {
        id: '5',
        name: 'Store 2',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBIDNT6JGHMHbuLbZMMG87ytyXnIPBnvsZgw&s',
        type: 'Store',
        email: 'store1@example.com',
        phone: '+1234567892',
        address: '125 Retail St',
        city: 'Store City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '5'),
    },
    {
        id: '6',
        name: 'Store 3',
        image: 'https://media.istockphoto.com/id/999084240/photo/businessman-checking-inventory-in-a-digital-tablet-at-a-supermarket.jpg?s=612x612&w=0&k=20&c=E9Xk97v2U7y17kYZHTtbrw74kQLTwdeogSHerLguDKA=',
        type: 'Store',
        email: 'store2@example.com',
        phone: '+1234567893',
        address: '126 Retail St',
        city: 'Store City',
        country: 'Country',
        subLocations: MOCK_SUB_LOCATIONS.filter(sub => sub.parentId === '6'),
    },
];