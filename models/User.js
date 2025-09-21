const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const defineUser = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is required'
        },
        len: {
          args: [2, 50],
          msg: 'First name must be between 2 and 50 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Last name is required'
        },
        len: {
          args: [2, 50],
          msg: 'Last name must be between 2 and 50 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please enter a valid email'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Phone number is required'
        },
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Please enter a valid phone number'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long'
        }
      }
    },
    userType: {
      type: DataTypes.ENUM('personal', 'agent', 'merchant', 'admin'),
      allowNull: false,
      defaultValue: 'personal'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isKYCVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phoneVerificationToken: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    twoFactorAuth: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        enabled: false,
        secret: null,
        backupCodes: []
      }
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        avatar: null,
        dateOfBirth: null,
        gender: null,
        address: {
          street: null,
          city: null,
          state: null,
          country: null,
          zipCode: null
        },
        kycDocuments: {
          identityType: null,
          identityNumber: null,
          identityDocument: null,
          proofOfAddress: null,
          status: 'pending'
        }
      }
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        currency: 'USD',
        language: 'en',
        theme: 'light',
        timezone: 'UTC'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['phone']
      },
      {
        fields: ['userType']
      },
      {
        fields: ['status']
      },
      {
        fields: ['isEmailVerified']
      },
      {
        fields: ['isPhoneVerified']
      },
      {
        fields: ['isKYCVerified']
      }
    ]
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.incLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null
      });
    }
    
    const updates = { loginAttempts: this.loginAttempts + 1 };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
      updates.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }
    
    return this.update(updates);
  };

  User.prototype.resetLoginAttempts = async function() {
    return this.update({
      loginAttempts: 0,
      lockUntil: null
    });
  };

  // Virtual properties
  Object.defineProperty(User.prototype, 'isLocked', {
    get: function() {
      return !!(this.lockUntil && this.lockUntil > Date.now());
    }
  });

  // Class methods
  User.findByEmailOrPhone = function(identifier) {
    return this.findOne({
      where: {
        [sequelize.Op.or]: [
          { email: identifier.toLowerCase() },
          { phone: identifier }
        ]
      }
    });
  };

  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.findByPhone = function(phone) {
    return this.findOne({
      where: { phone }
    });
  };

  User.findByResetToken = function(token) {
    return this.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  User.findByEmailVerificationToken = function(token) {
    return this.findOne({
      where: { emailVerificationToken: token }
    });
  };

  User.findByPhoneVerificationToken = function(token) {
    return this.findOne({
      where: { phoneVerificationToken: token }
    });
  };

  User.generateWalletId = function(userType) {
    const prefix = {
      personal: 'PER',
      agent: 'AGT',
      merchant: 'MER',
      admin: 'ADM'
    };
    
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix[userType] || 'PER'}${randomNum}`;
  };

  // Hooks
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    // Normalize email
    if (user.email) {
      user.email = user.email.toLowerCase().trim();
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    // Normalize email
    if (user.changed('email')) {
      user.email = user.email.toLowerCase().trim();
    }
  });

  return User;
};

module.exports = defineUser;