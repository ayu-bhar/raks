class user{
        uid;
        name;
        email;
        phone;
        rollNumber;
        role;
        emailVerified;
        createdAt;
    constructor({ uid, name, email, phone, rollNumber = null, role, emailVerified = false, createdAt = new Date().toISOString() }) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.rollNumber = rollNumber;
    this.role = role;
    this.emailVerified = emailVerified;
    this.createdAt = createdAt;
  }

}
export default user;