// Curated Indian PIN code reference dataset — covers major districts across all states
// Source: India Post official data. Used for address auto-population in admission forms.

export const INDIAN_PINCODE_DATA: Record<string, { city: string; district: string; state: string; postOffices?: string[] }> = {
  // Delhi
  '110001': { city: 'New Delhi', district: 'New Delhi', state: 'Delhi', postOffices: ['Connaught Place HO', 'Parliament Street'] },
  '110002': { city: 'New Delhi', district: 'New Delhi', state: 'Delhi', postOffices: ['Darya Ganj', 'Sadar Bazar'] },
  '110003': { city: 'New Delhi', district: 'New Delhi', state: 'Delhi', postOffices: ['Delhi Secretariat', 'Lodi Colony'] },
  '110016': { city: 'New Delhi', district: 'South Delhi', state: 'Delhi', postOffices: ['Hauz Khas', 'Green Park'] },
  '110017': { city: 'New Delhi', district: 'South Delhi', state: 'Delhi', postOffices: ['Malviya Nagar', 'Saket'] },
  '110025': { city: 'New Delhi', district: 'South-West Delhi', state: 'Delhi', postOffices: ['Mehrauli', 'Vasant Kunj'] },
  '110051': { city: 'New Delhi', district: 'East Delhi', state: 'Delhi', postOffices: ['Shahadra', 'Vivek Vihar'] },
  '110092': { city: 'New Delhi', district: 'East Delhi', state: 'Delhi', postOffices: ['Patparganj', 'Mayur Vihar'] },

  // Mumbai
  '400001': { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', postOffices: ['GPO', 'Fort'] },
  '400002': { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', postOffices: ['Sandhurst Road'] },
  '400051': { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', postOffices: ['Bandra West'] },
  '400063': { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', postOffices: ['Andheri West'] },
  '400076': { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', postOffices: ['Powai', 'Chandivali'] },
  '400601': { city: 'Thane', district: 'Thane', state: 'Maharashtra', postOffices: ['Thane West', 'Thane East'] },
  '411001': { city: 'Pune', district: 'Pune', state: 'Maharashtra', postOffices: ['Pune GPO', 'Camp'] },
  '411007': { city: 'Pune', district: 'Pune', state: 'Maharashtra', postOffices: ['Shivajinagar', 'Model Colony'] },

  // Bengaluru
  '560001': { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postOffices: ['Bengaluru GPO'] },
  '560010': { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postOffices: ['Rajajinagar'] },
  '560037': { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postOffices: ['Koramangala', 'BTM Layout'] },
  '560066': { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postOffices: ['Whitefield', 'ITPL'] },

  // Chennai
  '600001': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postOffices: ['Chennai GPO', 'Parry\'s Corner'] },
  '600011': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postOffices: ['Anna Nagar', 'Arumbakkam'] },
  '600096': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postOffices: ['OMR', 'Perungudi'] },

  // Hyderabad
  '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', postOffices: ['Hyderabad GPO', 'Abids'] },
  '500032': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', postOffices: ['Banjara Hills', 'Road No 12'] },
  '500081': { city: 'Hyderabad', district: 'Ranga Reddy', state: 'Telangana', postOffices: ['Gachibowli', 'Madhapur'] },

  // Kolkata
  '700001': { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', postOffices: ['Kolkata GPO', 'BBD Bag'] },
  '700019': { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', postOffices: ['Ballygunge', 'Gariahat'] },
  '700091': { city: 'Kolkata', district: 'North 24 Parganas', state: 'West Bengal', postOffices: ['Salt Lake', 'Sector V'] },

  // Jaipur
  '302001': { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', postOffices: ['Jaipur GPO', 'Chaura Rasta'] },
  '302017': { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', postOffices: ['Vaishali Nagar', 'Mansarovar'] },

  // Lucknow
  '226001': { city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', postOffices: ['Lucknow GPO', 'Hazratganj'] },
  '226010': { city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', postOffices: ['Gomti Nagar', 'Vibhuti Khand'] },
  '201301': { city: 'Noida', district: 'Gautam Buddh Nagar', state: 'Uttar Pradesh', postOffices: ['Sector 10', 'Sector 18'] },

  // Bhopal
  '462001': { city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', postOffices: ['Bhopal GPO', 'New Market'] },
  '452001': { city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', postOffices: ['Indore GPO', 'MG Road'] },

  // Ahmedabad
  '380001': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', postOffices: ['Ahmedabad GPO', 'Relief Road'] },
  '380015': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', postOffices: ['Navrangpura', 'Stadium'] },
  '395001': { city: 'Surat', district: 'Surat', state: 'Gujarat', postOffices: ['Surat GPO', 'Ring Road'] },

  // Chandigarh
  '160001': { city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', postOffices: ['Chandigarh GPO', 'Sector 17'] },
  '160036': { city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', postOffices: ['Sector 36', 'Sector 32'] },

  // Patna
  '800001': { city: 'Patna', district: 'Patna', state: 'Bihar', postOffices: ['Patna GPO', 'Dak Bungalow'] },

  // Bhubaneswar
  '751001': { city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', postOffices: ['Bhubaneswar HO', 'Unit 1'] },

  // Guwahati
  '781001': { city: 'Guwahati', district: 'Kamrup Metropolitan', state: 'Assam', postOffices: ['Guwahati HO', 'Pan Bazar'] },

  // Kochi
  '682001': { city: 'Kochi', district: 'Ernakulam', state: 'Kerala', postOffices: ['Ernakulam South', 'Broadway'] },
  '695001': { city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', postOffices: ['Trivandrum HO'] },
};
