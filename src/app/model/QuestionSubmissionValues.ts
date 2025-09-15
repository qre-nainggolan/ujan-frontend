// src/app/model/QuestionSubmission.ts
export class QuestionSubmissionValues {
  Package_ID?: string = "";
  Question_ID?: string = "";
  Question?: string = "";
  Type_ID?: string = "";
  OptionA?: string = "";
  OptionB?: string = "";
  OptionC?: string = "";
  OptionD?: string = "";
  OptionE?: string = "";
  Answer_Text?: string = "";
  Answer?: string = "";
  Package_Name?: string = "";
  Explanation?: string = "";
  DateCreate?: string = "";
  Note?: string = "";
  Image?: string = "";
  Category?: string = "";

  constructor(initial?: QuestionSubmissionValues) {
    if (initial) Object.assign(this, initial);
  }
}
