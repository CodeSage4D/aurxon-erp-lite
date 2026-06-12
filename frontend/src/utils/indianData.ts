export interface StateData {
  state: string;
  districts: Record<string, string[]>;
}

export const INDIAN_STATES_AND_UTS: StateData[] = [
  {
    state: "Andhra Pradesh",
    districts: {
      "Visakhapatnam": ["Visakhapatnam", "Anakapalle", "Bheemunipatnam", "Gajuwaka"],
      "Vijayawada / Krishna": ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid"],
      "Guntur": ["Guntur", "Tenali", "Narasaraopet", "Bapatla"],
      "Nellore": ["Nellore", "Kavali", "Gudur", "Sullurpeta"],
      "Kurnool": ["Kurnool", "Adoni", "Nandyal", "Yemmiganur"],
      "Tirupati / Chittoor": ["Tirupati", "Chittoor", "Madanapalle", "Srikalahasti"]
    }
  },
  {
    state: "Arunachal Pradesh",
    districts: {
      "Papum Pare": ["Itanagar", "Naharlagun", "Yupia"],
      "East Siang": ["Pasighat"],
      "West Kameng": ["Bomdila"],
      "Tawang": ["Tawang"]
    }
  },
  {
    state: "Assam",
    districts: {
      "Kamrup Metropolitan": ["Guwahati", "Dispur", "North Guwahati"],
      "Dibrugarh": ["Dibrugarh", "Tinsukia", "Dulianjan"],
      "Cachar": ["Silchar", "Lakhipur"],
      "Jorhat": ["Jorhat", "Mariani", "Titabor"]
    }
  },
  {
    state: "Bihar",
    districts: {
      "Patna": ["Patna", "Danapur", "Khagaul", "Fatuha"],
      "Gaya": ["Gaya", "Bodh Gaya", "Sherghati"],
      "Bhagalpur": ["Bhagalpur", "Sultanganj", "Naugachhia"],
      "Muzaffarpur": ["Muzaffarpur", "Kanti", "Motihari"]
    }
  },
  {
    state: "Chhattisgarh",
    districts: {
      "Raipur": ["Raipur", "Birgaon", "Tilda Newra"],
      "Durg": ["Bhilai", "Durg", "Charoda"],
      "Bilaspur": ["Bilaspur", "Mungeli", "Kota"]
    }
  },
  {
    state: "Goa",
    districts: {
      "North Goa": ["Panaji", "Mapusa", "Bicholim"],
      "South Goa": ["Margao", "Vasco da Gama", "Ponda"]
    }
  },
  {
    state: "Gujarat",
    districts: {
      "Ahmedabad": ["Ahmedabad", "Sanand", "Bavla", "Viramgam"],
      "Surat": ["Surat", "Vyara", "Bardoli", "Kamrej"],
      "Vadodara": ["Vadodara", "Padra", "Dabhoi", "Karjan"],
      "Rajkot": ["Rajkot", "Gondal", "Jetpur", "Morbi"],
      "Gandhinagar": ["Gandhinagar", "Kalol", "Dehgam"]
    }
  },
  {
    state: "Haryana",
    districts: {
      "Gurugram": ["Gurugram", "Sohna", "Pataudi", "Manesar"],
      "Faridabad": ["Faridabad", "Ballabhgarh"],
      "Ambala": ["Ambala Cantt", "Ambala City", "Naraingarh"],
      "Panipat": ["Panipat", "Samalkha"],
      "Rohtak": ["Rohtak", "Meham"]
    }
  },
  {
    state: "Himachal Pradesh",
    districts: {
      "Shimla": ["Shimla", "Rampur", "Rohru"],
      "Kangra": ["Dharamshala", "Kangra", "Palampur"],
      "Mandi": ["Mandi", "Sundernagar"]
    }
  },
  {
    state: "Jharkhand",
    districts: {
      "Ranchi": ["Ranchi", "Bundu", "Khelari"],
      "East Singhbhum": ["Jamshedpur", "Mango", "Ghatshila"],
      "Dhanbad": ["Dhanbad", "Jharia", "Sindri"]
    }
  },
  {
    state: "Karnataka",
    districts: {
      "Bengaluru Urban": ["Bengaluru", "Yelahanka", "Kengeri", "Whitefield"],
      "Mysuru": ["Mysuru", "Hunsur", "Nanjangud"],
      "Dharwad": ["Hubballi", "Dharwad", "Kalghatgi"],
      "Dakshina Kannada": ["Mangaluru", "Ullal", "Bantwal"],
      "Belagavi": ["Belagavi", "Gokak", "Chikodi"]
    }
  },
  {
    state: "Kerala",
    districts: {
      "Ernakulam": ["Kochi", "Aluva", "Angamaly", "Perumbavoor"],
      "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad"],
      "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy"],
      "Thrissur": ["Thrissur", "Chalakudy", "Guruvayur"]
    }
  },
  {
    state: "Madhya Pradesh",
    districts: {
      "Indore": ["Indore", "Mhow", "Depalpur", "Sanwer"],
      "Bhopal": ["Bhopal", "Bairagarh"],
      "Jabalpur": ["Jabalpur", "Sihora", "Katni"],
      "Gwalior": ["Gwalior", "Dabra", "Bhander"]
    }
  },
  {
    state: "Maharashtra",
    districts: {
      "Mumbai City": ["Mumbai", "Colaba", "Dadar", "Bandra"],
      "Pune": ["Pune", "Pimpri-Chinchwad", "Chakan", "Baramati"],
      "Nagpur": ["Nagpur", "Kamptee", "Umred"],
      "Thane": ["Thane", "Kalyan", "Dombivli", "Navi Mumbai", "Mira-Bhayandar"],
      "Nashik": ["Nashik", "Malegaon", "Deolali"]
    }
  },
  {
    state: "Manipur",
    districts: {
      "Imphal West": ["Imphal", "Mayang Imphal"],
      "Thoubal": ["Thoubal", "Kakching"]
    }
  },
  {
    state: "Meghalaya",
    districts: {
      "East Khasi Hills": ["Shillong", "Mawlai", "Cherrapunji"],
      "West Garo Hills": ["Tura"]
    }
  },
  {
    state: "Mizoram",
    districts: {
      "Aizawl": ["Aizawl"],
      "Lunglei": ["Lunglei"]
    }
  },
  {
    state: "Nagaland",
    districts: {
      "Dimapur": ["Dimapur", "Chumoukedima"],
      "Kohima": ["Kohima"]
    }
  },
  {
    state: "Odisha",
    districts: {
      "Khurda": ["Bhubaneswar", "Jatni", "Khurda"],
      "Cuttack": ["Cuttack", "Choudwar"],
      "Ganjam": ["Berhampur", "Chhatrapur"]
    }
  },
  {
    state: "Punjab",
    districts: {
      "Ludhiana": ["Ludhiana", "Khanna", "Jagraon"],
      "Amritsar": ["Amritsar", "Tarn Taran"],
      "Jalandhar": ["Jalandhar", "Kartarpur", "Nakodar"]
    }
  },
  {
    state: "Rajasthan",
    districts: {
      "Jaipur": ["Jaipur", "Chomu", "Bagru", "Kotputli"],
      "Jodhpur": ["Jodhpur", "Bilara", "Phalodi"],
      "Kota": ["Kota", "Sangod"],
      "Udaipur": ["Udaipur", "Salumbar"]
    }
  },
  {
    state: "Sikkim",
    districts: {
      "Gangtok": ["Gangtok", "Singtam"],
      "Namchi": ["Namchi"]
    }
  },
  {
    state: "Tamil Nadu",
    districts: {
      "Chennai": ["Chennai", "Tambaram", "Ambattur"],
      "Coimbatore": ["Coimbatore", "Pollachi", "Mettupalayam"],
      "Madurai": ["Madurai", "Melur", "Thirumangalam"],
      "Tiruchirappalli": ["Trichy", "Manapparai", "Thuraiyur"]
    }
  },
  {
    state: "Telangana",
    districts: {
      "Hyderabad": ["Hyderabad", "Secunderabad"],
      "Medchal-Malkajgiri": ["Kukatpally", "Malkajgiri", "Alwal"],
      "Warangal": ["Warangal", "Hanamkonda"]
    }
  },
  {
    state: "Tripura",
    districts: {
      "West Tripura": ["Agartala"],
      "Unakoti": ["Kailasahar"]
    }
  },
  {
    state: "Uttar Pradesh",
    districts: {
      "Gautam Buddha Nagar": ["Noida", "Greater Noida", "Dadri"],
      "Lucknow": ["Lucknow", "Malihabad"],
      "Kanpur Nagar": ["Kanpur", "Bithoor"],
      "Ghaziabad": ["Ghaziabad", "Modinagar", "Loni"],
      "Agra": ["Agra", "Fatehpur Sikri"]
    }
  },
  {
    state: "Uttarakhand",
    districts: {
      "Dehradun": ["Dehradun", "Rishikesh", "Mussoorie"],
      "Haridwar": ["Haridwar", "Roorkee"]
    }
  },
  {
    state: "West Bengal",
    districts: {
      "Kolkata": ["Kolkata"],
      "North 24 Parganas": ["Bidhannagar / Salt Lake", "Rajarhat", "Barasat", "Barrackpore"],
      "Howrah": ["Howrah", "Bally", "Uluberia"],
      "Darjeeling": ["Siliguri", "Darjeeling", "Kalimpong"]
    }
  },
  // UNION TERRITORIES
  {
    state: "Andaman and Nicobar Islands",
    districts: {
      "South Andaman": ["Port Blair"]
    }
  },
  {
    state: "Chandigarh",
    districts: {
      "Chandigarh": ["Chandigarh"]
    }
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    districts: {
      "Daman": ["Daman"],
      "Diu": ["Diu"],
      "Dadra & Nagar Haveli": ["Silvassa"]
    }
  },
  {
    state: "Delhi",
    districts: {
      "New Delhi": ["Chanakyapuri", "Connaught Place", "Dwarka", "Vasant Kunj"],
      "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Nehru Place"],
      "West Delhi": ["Rajouri Garden", "Janakpuri", "Punjabi Bagh", "Vikaspuri"],
      "North West Delhi": ["Rohini", "Pitampura", "Shalimar Bagh"],
      "East Delhi": ["Preet Vihar", "Laxmi Nagar", "Mayur Vihar"]
    }
  },
  {
    state: "Jammu and Kashmir",
    districts: {
      "Srinagar": ["Srinagar", "Ganderbal"],
      "Jammu": ["Jammu", "Akhnoor", "Katra"]
    }
  },
  {
    state: "Ladakh",
    districts: {
      "Leh": ["Leh"],
      "Kargil": ["Kargil"]
    }
  },
  {
    state: "Lakshadweep",
    districts: {
      "Lakshadweep": ["Kavaratti", "Minicoy"]
    }
  },
  {
    state: "Puducherry",
    districts: {
      "Puducherry": ["Puducherry"],
      "Karaikal": ["Karaikal"],
      "Mahe": ["Mahe"],
      "Yanam": ["Yanam"]
    }
  }
];

export const CITIZENSHIP_LIST = [
  "Indian",
  "Nepalese",
  "Bhutanese",
  "Bangladeshi",
  "Sri Lankan",
  "Afghan",
  "American (US)",
  "British (UK)",
  "Canadian",
  "Australian",
  "Emirati (UAE)",
  "Singaporean",
  "German",
  "French",
  "Other"
];

export interface CountryPhoneConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  regex: RegExp;
  errorMsg: string;
}

export const COUNTRY_PHONE_CONFIGS: CountryPhoneConfig[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    placeholder: "9988776655",
    regex: /^\d{10}$/,
    errorMsg: "Indian mobile number must be exactly 10 digits."
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "2025550199",
    regex: /^\d{10}$/,
    errorMsg: "US phone number must be exactly 10 digits."
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    placeholder: "7911123456",
    regex: /^\d{10}$/,
    errorMsg: "UK phone number must be exactly 10 digits."
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    placeholder: "412345678",
    regex: /^\d{9}$/,
    errorMsg: "Australian phone number must be exactly 9 digits."
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    placeholder: "501234567",
    regex: /^\d{9}$/,
    errorMsg: "UAE phone number must be exactly 9 digits."
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    placeholder: "81234567",
    regex: /^\d{8}$/,
    errorMsg: "Singapore phone number must be exactly 8 digits."
  },
  {
    code: "NP",
    name: "Nepal",
    dialCode: "+977",
    flag: "🇳🇵",
    placeholder: "9801234567",
    regex: /^\d{10}$/,
    errorMsg: "Nepal mobile number must be exactly 10 digits."
  },
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    flag: "🇧🇩",
    placeholder: "1712345678",
    regex: /^\d{10}$/,
    errorMsg: "Bangladesh mobile number must be exactly 10 digits."
  },
  {
    code: "LK",
    name: "Sri Lanka",
    dialCode: "+94",
    flag: "🇱🇰",
    placeholder: "712345678",
    regex: /^\d{9}$/,
    errorMsg: "Sri Lanka phone number must be exactly 9 digits."
  }
];
