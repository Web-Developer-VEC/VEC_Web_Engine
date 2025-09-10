// roleAccess.js
const roleAccessMap = {
  gallery: ["super_admin", "gallery_admin"],
  help_desk:["super_admin"],
  hostel_details:["hostel_admin","super_admin"],
  other_facilities:["super_admin"],
  library:["library_admin","super_admin"]

  // add more collection → roles here
};

module.exports = roleAccessMap;
