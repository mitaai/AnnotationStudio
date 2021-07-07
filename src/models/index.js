class User {
  constructor(name, email, image, emailVerified) {
    if (name) {
      this.name = name;
    }
    if (email) {
      this.email = email;
      this.slug = email.replace(/[*+~.()'"!:@]/g, '-');
      if (email === process.env.ADMIN_EMAIL) {
        this.role = 'admin';
      } else this.role = 'user';
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

export default {
  User: {
    model: User,
    schema: {
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
        slug: {
          type: 'varchar',
          nullable: true,
        },
        role: {
          type: 'varchar',
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
      indices: [
        {
          name: 'email',
          unique: true,
          sparse: true,
          columns: ['email'],
        },
        {
          name: 'slug',
          unique: true,
          sparse: true,
          columns: ['slug'],
        },
      ],
    },
  },
};
