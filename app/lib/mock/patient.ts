type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    email?: string;
    phone_number?: string;
    address?: string;
    chart_id?: string;
};


export const MOCK_PATIENTS: Patient[] = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-05-15',
        gender: 'Male',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        address: '123 Main St, Anytown USA',
        chart_id: 'JD12345'
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1985-11-20',
        gender: 'Female',
        email: 'jane.smith@example.com',
        phone_number: '555-987-6543',
        address: '456 Oak Ave, Anytown USA',
        chart_id: 'JS67890'
    },
    {
        id: 3,
        first_name: 'Peter',
        last_name: 'Jones',
        date_of_birth: '1978-02-10',
        gender: 'Male',
        email: 'peter.jones@example.com',
        phone_number: '555-555-1234',
        address: '789 Pine Ln, Anytown USA',
        chart_id: 'PJ13579'
    },
];