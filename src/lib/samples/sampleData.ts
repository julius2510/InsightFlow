export interface SampleDatasetMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  rowCount: number;
  columnCount: number;
  csvData: string;
}

// 1. Sales Analytics: Retail orders, revenue, profit, discount, regions, segments
const salesCSV = `Order_ID,Date,Region,Category,Sub_Category,Customer_Segment,Sales,Quantity,Discount,Profit
ORD-1001,2024-01-05,West,Technology,Phones,Corporate,749.99,2,0.0,187.50
ORD-1002,2024-01-08,East,Furniture,Chairs,Consumer,320.50,1,0.1,45.20
ORD-1003,2024-01-12,Central,Office Supplies,Binders,Consumer,45.20,4,0.2,12.80
ORD-1004,2024-01-15,South,Technology,Accessories,Home Office,180.00,3,0.0,54.00
ORD-1005,2024-01-20,West,Furniture,Tables,Corporate,890.00,1,0.15,-65.00
ORD-1006,2024-01-22,East,Technology,Laptops,Consumer,1450.00,1,0.05,320.00
ORD-1007,2024-01-28,Central,Office Supplies,Paper,Consumer,28.40,5,0.0,8.50
ORD-1008,2024-02-02,South,Furniture,Bookcases,Corporate,410.00,2,0.2,35.00
ORD-1009,2024-02-05,West,Technology,Phones,Home Office,620.00,1,0.0,155.00
ORD-1010,2024-02-10,East,Office Supplies,Storage,Corporate,215.00,3,0.1,38.00
ORD-1011,2024-02-14,Central,Technology,Accessories,Consumer,95.00,2,0.0,28.50
ORD-1012,2024-02-18,South,Furniture,Chairs,Home Office,350.00,2,0.15,42.00
ORD-1013,2024-02-23,West,Office Supplies,Binders,Corporate,52.00,5,0.2,14.60
ORD-1014,2024-02-27,East,Technology,Laptops,Corporate,2200.00,2,0.1,480.00
ORD-1015,2024-03-02,Central,Furniture,Tables,Consumer,780.00,1,0.25,-90.00
ORD-1016,2024-03-06,South,Office Supplies,Paper,Consumer,35.00,6,0.0,10.50
ORD-1017,2024-03-11,West,Technology,Accessories,Corporate,145.00,2,0.05,43.50
ORD-1018,2024-03-15,East,Furniture,Bookcases,Home Office,520.00,2,0.1,62.40
ORD-1019,2024-03-20,Central,Office Supplies,Storage,Consumer,180.00,2,0.0,36.00
ORD-1020,2024-03-25,South,Technology,Phones,Corporate,820.00,1,0.0,205.00
ORD-1021,2024-03-29,West,Furniture,Chairs,Corporate,480.00,3,0.1,68.00
ORD-1022,2024-04-03,East,Office Supplies,Binders,Consumer,38.00,3,0.2,9.50
ORD-1023,2024-04-08,Central,Technology,Laptops,Home Office,1650.00,1,0.0,396.00
ORD-1024,2024-04-12,South,Furniture,Tables,Corporate,1050.00,2,0.2,-80.00
ORD-1025,2024-04-16,West,Office Supplies,Paper,Corporate,42.00,7,0.0,13.00
ORD-1026,2024-04-21,East,Technology,Accessories,Consumer,110.00,2,0.0,33.00
ORD-1027,2024-04-25,Central,Furniture,Bookcases,Consumer,390.00,1,0.15,29.25
ORD-1028,2024-04-30,South,Office Supplies,Storage,Home Office,160.00,2,0.1,24.00
ORD-1029,2024-05-04,West,Technology,Phones,Consumer,940.00,2,0.1,216.00
ORD-1030,2024-05-09,East,Furniture,Chairs,Consumer,295.00,1,0.0,59.00
ORD-1031,2024-05-13,Central,Office Supplies,Binders,Corporate,64.00,4,0.1,19.20
ORD-1032,2024-05-18,South,Technology,Laptops,Corporate,1850.00,1,0.05,425.00
ORD-1033,2024-05-22,West,Furniture,Tables,Home Office,690.00,1,0.15,-40.00
ORD-1034,2024-05-27,East,Office Supplies,Paper,Consumer,55.00,8,0.0,16.50
ORD-1035,2024-06-01,Central,Technology,Accessories,Corporate,220.00,4,0.1,55.00
ORD-1036,2024-06-05,South,Furniture,Bookcases,Consumer,460.00,2,0.0,92.00
ORD-1037,2024-06-10,West,Office Supplies,Storage,Corporate,310.00,3,0.15,46.50
ORD-1038,2024-06-15,East,Technology,Phones,Home Office,710.00,1,0.0,177.50
ORD-1039,2024-06-19,Central,Furniture,Chairs,Corporate,540.00,2,0.2,54.00
ORD-1040,2024-06-24,South,Office Supplies,Binders,Consumer,48.00,4,0.0,14.40
ORD-1041,2024-06-28,West,Technology,Laptops,Consumer,1399.00,1,0.0,350.00
ORD-1042,2024-07-02,East,Furniture,Tables,Consumer,820.00,1,0.2,-60.00
ORD-1043,2024-07-07,Central,Office Supplies,Paper,Corporate,32.00,5,0.0,9.60
ORD-1044,2024-07-12,South,Technology,Accessories,Home Office,130.00,2,0.0,39.00
ORD-1045,2024-07-16,West,Furniture,Bookcases,Corporate,610.00,2,0.1,73.20
ORD-1046,2024-07-21,East,Office Supplies,Storage,Consumer,240.00,2,0.05,48.00
ORD-1047,2024-07-25,Central,Technology,Phones,Corporate,880.00,1,0.05,198.00
ORD-1048,2024-07-30,South,Furniture,Chairs,Consumer,380.00,2,0.1,57.00
ORD-1049,2024-08-04,West,Office Supplies,Binders,Home Office,58.00,5,0.15,14.80
ORD-1050,2024-08-09,East,Technology,Laptops,Corporate,2450.00,2,0.1,550.00
ORD-1050,2024-08-09,East,Technology,Laptops,Corporate,2450.00,2,0.1,550.00`;

// 2. Customer & Marketing Analytics: SaaS churn, satisfaction, spend, channels, tickets
const customerCSV = `Customer_ID,Age,Gender,Tenure_Months,Monthly_Spend,Acquisition_Channel,Support_Tickets,Satisfaction_Score,Campaign_Responded,Churned
CUST-201,34,Female,14,79.50,Organic,1,4.5,Yes,0
CUST-202,45,Male,36,129.00,Paid Ads,3,3.8,No,0
CUST-203,26,Non-Binary,4,45.00,Social Media,5,2.1,No,1
CUST-204,52,Female,48,185.00,Referral,0,4.9,Yes,0
CUST-205,38,Male,8,89.00,Organic,4,2.5,No,1
CUST-206,29,Female,22,110.00,Paid Ads,2,4.0,Yes,0
CUST-207,41,Male,19,95.00,Social Media,1,4.2,No,0
CUST-208,61,Female,54,210.00,Referral,2,4.7,Yes,0
CUST-209,23,Male,3,39.00,Social Media,6,1.8,No,1
CUST-210,36,Female,28,140.00,Paid Ads,1,4.6,Yes,0
CUST-211,48,Male,11,75.00,Organic,4,2.8,No,1
CUST-212,31,Female,17,105.00,Paid Ads,0,4.8,Yes,0
CUST-213,27,Male,6,55.00,Social Media,5,2.3,No,1
CUST-214,44,Female,32,150.00,Referral,2,4.1,No,0
CUST-215,39,Male,24,120.00,Organic,2,3.9,Yes,0
CUST-216,55,Female,42,190.00,Paid Ads,1,4.6,Yes,0
CUST-217,33,Non-Binary,9,68.00,Social Media,4,2.7,No,1
CUST-218,46,Male,38,165.00,Referral,0,5.0,Yes,0
CUST-219,25,Female,5,49.00,Organic,3,3.1,No,0
CUST-220,58,Male,50,225.00,Paid Ads,3,4.0,Yes,0
CUST-221,37,Female,15,85.00,Social Media,2,3.7,No,0
CUST-222,42,Male,21,115.00,Organic,1,4.3,Yes,0
CUST-223,28,Female,7,59.00,Paid Ads,5,2.0,No,1
CUST-224,50,Male,45,175.00,Referral,1,4.5,Yes,0
CUST-225,35,Female,13,92.00,Organic,2,3.8,No,0
CUST-226,30,Male,18,102.00,Social Media,3,3.5,Yes,0
CUST-227,47,Female,29,135.00,Paid Ads,0,4.9,Yes,0
CUST-228,24,Non-Binary,2,42.00,Organic,7,1.5,No,1
CUST-229,53,Male,40,180.00,Referral,2,4.4,Yes,0
CUST-230,32,Female,16,88.00,Paid Ads,1,4.1,No,0
CUST-231,40,Male,25,125.00,Social Media,4,3.0,No,1
CUST-232,29,Female,12,78.00,Organic,2,3.9,Yes,0
CUST-233,49,Male,34,160.00,Referral,1,4.7,Yes,0
CUST-234,36,Female,20,108.00,Paid Ads,3,3.6,No,0
CUST-235,26,Male,4,48.00,Social Media,6,1.9,No,1
CUST-236,57,Female,52,230.00,Organic,0,4.9,Yes,0
CUST-237,38,Male,23,118.00,Paid Ads,2,4.0,No,0
CUST-238,43,Female,31,145.00,Referral,1,4.5,Yes,0
CUST-239,33,Male,10,72.00,Social Media,5,2.4,No,1
CUST-240,51,Female,46,195.00,Organic,2,4.3,Yes,0
CUST-240,51,Female,46,195.00,Organic,2,4.3,Yes,0`;

// 3. Student Performance: Study hours, attendance, parental education, exams
const studentCSV = `Student_ID,Gender,Grade_Level,Study_Hours_Weekly,Attendance_Rate,Parent_Education,Extracurricular,Internet_Access,Midterm_Score,Final_Score
STU-501,Female,11th,18.5,96.0,Bachelor's,Yes,Yes,88.5,92.0
STU-502,Male,10th,8.0,82.5,High School,No,Yes,65.0,68.5
STU-503,Female,12th,22.0,98.5,Master's,Yes,Yes,94.0,96.5
STU-504,Male,11th,12.5,88.0,Some College,Yes,Yes,74.5,78.0
STU-505,Male,9th,5.0,76.0,High School,No,No,58.0,55.0
STU-506,Female,10th,15.0,91.0,Bachelor's,No,Yes,82.0,85.5
STU-507,Female,12th,20.0,95.0,Master's,Yes,Yes,90.5,93.0
STU-508,Male,11th,7.5,79.0,Some College,No,Yes,62.0,64.0
STU-509,Female,9th,14.0,90.0,Bachelor's,Yes,Yes,78.0,81.5
STU-510,Male,12th,19.0,94.0,Doctorate,Yes,Yes,91.0,95.0
STU-511,Female,10th,11.0,85.5,High School,No,Yes,71.0,73.5
STU-512,Male,11th,16.5,92.0,Bachelor's,Yes,Yes,85.0,88.0
STU-513,Male,9th,6.0,73.0,High School,No,No,54.0,52.0
STU-514,Female,12th,24.0,99.0,Master's,Yes,Yes,96.0,98.0
STU-515,Female,11th,13.0,87.0,Some College,No,Yes,76.0,79.0
STU-516,Male,10th,9.5,81.0,High School,Yes,Yes,68.0,70.5
STU-517,Female,9th,16.0,93.0,Bachelor's,Yes,Yes,84.0,86.0
STU-518,Male,12th,21.5,97.0,Doctorate,Yes,Yes,93.5,96.0
STU-519,Female,10th,10.5,84.0,Some College,No,Yes,70.0,72.0
STU-520,Male,11th,17.0,91.5,Bachelor's,No,Yes,86.0,87.5
STU-521,Female,12th,18.0,94.5,Bachelor's,Yes,Yes,89.0,91.5
STU-522,Male,9th,4.5,70.5,High School,No,No,50.0,49.0
STU-523,Female,11th,15.5,89.0,Some College,Yes,Yes,80.5,83.0
STU-524,Male,10th,12.0,86.0,Bachelor's,No,Yes,75.0,77.5
STU-525,Female,12th,23.0,98.0,Master's,Yes,Yes,95.0,97.0
STU-526,Male,11th,8.5,80.0,High School,No,Yes,66.0,67.5
STU-527,Female,9th,13.5,88.5,Some College,Yes,Yes,77.0,80.0
STU-528,Male,12th,20.5,96.0,Doctorate,Yes,Yes,92.0,94.5
STU-529,Female,10th,14.5,90.5,Bachelor's,No,Yes,81.0,84.0
STU-530,Male,11th,11.5,83.0,High School,Yes,Yes,72.0,75.0
STU-531,Female,12th,19.5,95.5,Master's,Yes,Yes,89.5,92.5
STU-532,Male,9th,7.0,75.0,Some College,No,Yes,60.0,61.5
STU-533,Female,11th,16.0,91.0,Bachelor's,Yes,Yes,83.5,86.5
STU-534,Male,10th,10.0,82.0,High School,No,Yes,69.0,71.0
STU-535,Female,12th,25.0,99.5,Doctorate,Yes,Yes,98.0,99.0
STU-536,Male,11th,14.0,87.5,Some College,Yes,Yes,78.0,80.5
STU-537,Female,9th,12.0,86.5,Bachelor's,No,Yes,74.0,76.5
STU-538,Male,12th,18.0,93.0,Bachelor's,Yes,Yes,87.0,90.0
STU-539,Female,10th,9.0,80.0,High School,No,No,64.0,66.0
STU-540,Male,11th,15.0,89.5,Some College,No,Yes,81.0,83.5
STU-540,Male,11th,15.0,89.5,Some College,No,Yes,81.0,83.5`;

export const SAMPLE_DATASETS: SampleDatasetMeta[] = [
  {
    id: 'sales',
    name: 'Retail Sales & Profitability',
    category: 'Sales Analytics',
    description:
      'Store sales transactions across regions, product categories, customer segments, discounts, and net profit margins.',
    badge: 'Popular',
    rowCount: 51,
    columnCount: 10,
    csvData: salesCSV.trim(),
  },
  {
    id: 'customers',
    name: 'SaaS Customer Churn & Retention',
    category: 'Customer Analytics',
    description:
      'Subscription metrics including customer age, tenure, monthly spend, acquisition channels, support tickets, and churn outcomes.',
    badge: 'Marketing',
    rowCount: 41,
    columnCount: 10,
    csvData: customerCSV.trim(),
  },
  {
    id: 'students',
    name: 'Academic Student Performance',
    category: 'Education Analytics',
    description:
      'Exam performance evaluated against weekly study hours, attendance rates, extracurricular activities, and parental education levels.',
    badge: 'Academic',
    rowCount: 41,
    columnCount: 10,
    csvData: studentCSV.trim(),
  },
];
