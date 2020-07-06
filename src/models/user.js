Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ASUser = undefined;
exports.ASUserSchema = exports.ASUser;

class ASUser {
  constructor(name, email, image, emailVerified) {
    if (name) {
      this.name = name;
    }

    if (email) {
      this.email = email;
    }

    if (image) {
      this.image = image;
    }

    if (emailVerified) {
      const currentDate = new Date();
      this.emailVerified = currentDate;
    }
  }
}
exports.ASUser = ASUser;

const ASUserSchema = {
  name: 'ASUser',
  target: ASUser,
  columns: {
    id: {
      primary: true,
      objectId: true,
      generated: true,
    },
    name: {
      type: 'varchar',
      nullable: true,
    },
    firstName: {
      type: 'varchar',
      nullable: true,
    },
    lastName: {
      type: 'varchar',
      nullable: true,
    },
    affiliation: {
      type: 'varchar',
      nullable: true,
    },
    email: {
      type: 'varchar',
      nullable: true,
    },
    emailVerified: {
      type: 'timestamp',
      nullable: true,
    },
    image: {
      type: 'varchar',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  indices: {
    name: 'email',
    unique: true,
    sparse: true,
    columns: ['email'],
  },
};
exports.ASUserSchema = ASUserSchema;
