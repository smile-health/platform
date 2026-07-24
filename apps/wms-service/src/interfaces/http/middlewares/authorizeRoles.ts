import { Request, Response, NextFunction } from 'express';

// only on this list, handle validation props
const listUserRoles = [
    'Super Admin',
    'Admin Healthcare Facility',
    'Operator Healthcare Facility',
    'Sanitarian Healthcare Facility',
    'Admin Transporter',
    'Operator Transporter',
    'Admin Landfill',
    'Operator Landfill',
    'Admin Treatment',
    'Operator Treatment',
    'Admin Recycler',
    'Operator Recycler',
    'Admin Specialized Transport',
    'Operator Specialized Transport',
    'Dinkes Manager',
    'Dinkes Admin',
    'Dinkes Operator',
    'Kemenkes Manager',
    'Kemenkes Admin',
    'Kemenkes Operator',
] as const;

export type UserRole = (typeof listUserRoles)[number];

export const allRead: UserRole[] = [
    'Super Admin',
    'Admin Healthcare Facility',
    'Operator Healthcare Facility',
    'Sanitarian Healthcare Facility',
    'Admin Transporter',
    'Operator Transporter',
    'Admin Landfill',
    'Operator Landfill',
    'Admin Treatment',
    'Operator Treatment',
    'Admin Recycler',
    'Operator Recycler',
    'Admin Specialized Transport',
    'Operator Specialized Transport',
    'Dinkes Manager',
    'Dinkes Admin',
    'Dinkes Operator',
    'Kemenkes Manager',
    'Kemenkes Admin',
    'Kemenkes Operator',
];

export const onlyManager: UserRole[] = ['Dinkes Manager'];

export const allGovernment: UserRole[] = ['Dinkes Manager', 'Dinkes Admin', 'Dinkes Operator'];

export const onlyHf: UserRole[] = [
    'Super Admin',
    'Admin Healthcare Facility',
    'Operator Healthcare Facility',
];

export const onlyOperator: UserRole[] = [
    'Super Admin',
    'Operator Healthcare Facility',
    'Operator Transporter',
    'Operator Landfill',
    'Operator Treatment',
    'Operator Recycler',
    'Operator Specialized Transport',
];

export const onlyAdmin: UserRole[] = [
    'Super Admin',
    'Admin Healthcare Facility',
    'Admin Transporter',
    'Admin Landfill',
    'Admin Treatment',
    'Admin Recycler',
    'Admin Specialized Transport',
];

export const onlyAdminHF: UserRole[] = ['Admin Healthcare Facility'];

export const onlySuperAdmin: UserRole[] = ['Super Admin'];

export function authorizeRoles(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            res.fail('Unauthorized: No user found', { isUnauthorizedError: true });
            return;
        }

        const userRoles = [
            'Super Admin',
            'Admin Healthcare Facility',
            'Operator Healthcare Facility',
            'Sanitarian Healthcare Facility',
            'Admin Transporter',
            'Operator Transporter',
            'Admin Landfill',
            'Operator Landfill',
            'Admin Treatment',
            'Operator Treatment',
            'Admin Recycler',
            'Operator Recycler',
            'Admin Specialized Transport',
            'Operator Specialized Transport',
            'Dinkes Manager',
            'Dinkes Admin',
            'Dinkes Operator',
            'Kemenkes Manager',
            'Kemenkes Admin',
            'Kemenkes Operator',
        ] as string[];

        // const userRoles = user.external_properties.roles as string[];

        const hasRole = userRoles.some((role) => allowedRoles.includes(role as UserRole));

        if (!hasRole) {
            res.fail('Forbidden: Access denied', { isForbiddenError: true });
            return;
        }

        next();
    };
}
