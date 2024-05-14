const { Entity, PrimaryGeneratedColumn, Column } = require("typeorm");

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id = undefined;

  @Column()
  username = "";

  @Column()
  password = "";
}

module.exports = {
  User,
};
