export interface ListUserPackage {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  discount: number;
  final_price: number;
  start_date: string;
  end_date: string;
  is_purchased: boolean;
  package_id: string;
}

export interface ListMainPackage {
  Package_ID: string;
  Question: string;
  Question_ID: string;
  Type?: string;
  Type_ID: string;
  DateCreate: string;
  Answer_Text: string;
  Answer: string;
  Name: string;
  OptionA: string;
  OptionB: string;
  OptionC: string;
  OptionD: string;
  OptionE: string;
  Note: string;
  Image: string;
  Category: string;
  Explanation: string;
}

export interface ListTypePackage {
  Type_ID: string;
  Type_Name: string;
  Package_ID: string;
  Description: string;
}
