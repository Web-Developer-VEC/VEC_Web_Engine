// roleAccess.js
const roleAccessMap = {

  //Top Nav Bar
  research : ["research_admin","super_admin"],

  //Second Nav Bar
  gallery: ["super_admin", "gallery_admin"],
  help_desk:["super_admin"],
  hostel_details:["hostel_admin","super_admin"],
  other_facilities:["super_admin"],
  library:["library_admin","super_admin"],
  iic : ["iic_admin","super_admin"],  
  transport : ["super_admin"],
  ecell : ["incubation_admin","super_admin"]
 
  
};

module.exports = roleAccessMap;
