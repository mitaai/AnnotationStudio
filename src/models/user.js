Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.User = undefined;
exports.UserSchema = exports.User;

class User {
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
exports.User = User;

const UserSchema = {
  name: 'User',
  target: User,
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
exports.UserSchema = UserSchema;
