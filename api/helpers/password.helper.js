const bcrypt = require('bcryptjs');

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

const decryptPassword = async (enteredPassword, userPassowd) => {
    const result = await bcrypt.compare(enteredPassword, userPassowd);
    return result;
};

module.exports = {
    encryptPassword,
    decryptPassword
}
