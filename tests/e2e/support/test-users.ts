export type TestUser = {
  label: string;
  email: string;
  password: string;
};

export const testUsers = {
  superAdmin: {
    label: 'super_admin',
    email: 'admin@pa-penajam.go.id',
    password: 'password',
  },
  operatorPersediaan: {
    label: 'operator_persediaan',
    email: 'operator_atk@demo.com',
    password: 'password',
  },
  kasubagUmum: {
    label: 'kasubag_umum',
    email: 'kasubag@demo.com',
    password: 'password',
  },
  kpa: {
    label: 'kpa',
    email: 'kpa@demo.com',
    password: 'password',
  },
  pegawai: {
    label: 'pegawai',
    email: 'pegawai@demo.com',
    password: 'password',
  },
} satisfies Record<string, TestUser>;
