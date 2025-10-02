// // utils/Validators.js

// /**
//  * Validate Email
//  * @param {string} email
//  * @returns {boolean}
//  */
// export const isValidEmail = (email) => {
//   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return regex.test(email);
// };

// /**
//  * Validate Password
//  * Must be at least 8 characters, include letters and numbers
//  * @param {string} password
//  * @returns {boolean}
//  */
// export const isValidPassword = (password) => {
//   const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
//   return regex.test(password);
// };

// /**
//  * Validate Name
//  * Only letters and spaces allowed
//  * @param {string} name
//  * @returns {boolean}
//  */
// export const isValidName = (name) => {
//   const regex = /^[A-Za-z\s]+$/;
//   return regex.test(name);
// };

// /**
//  * Validate Role
//  * Must be one of the allowed roles
//  * @param {string} role
//  * @returns {boolean}
//  */
// export const isValidRole = (role) => {
//   const allowedRoles = ["Team Leader", "Developer", "Project Manager"];
//   return allowedRoles.includes(role);
// };

// /**
//  * Validate Object ID (MongoDB)
//  * @param {string} id
//  * @returns {boolean}
//  */
// export const isValidObjectId = (id) => {
//   const regex = /^[0-9a-fA-F]{24}$/;
//   return regex.test(id);
// };
