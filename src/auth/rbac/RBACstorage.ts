import { IStorageRbac } from "nestjs-rbac";


export const RBAC: IStorageRbac = {
    roles: ['admin', 'user'],
    permissions: {
      produit: ['create', 'update', 'delete'],
      user: ['create', 'update', 'delete'],
      categorie: ['create', 'update', 'delete'],
      commande: ['create', 'update', 'delete'],
      auth: ['create', 'update', 'delete'],
    },
    grants: {
      admin: ['produit', 'user', 'categorie', 'auth'],
      user: ['produit', 'user'],
  
    },
    filters: {},
  };
  