/*// src/app/model/QuestionSubmission.ts
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

  imageFile?: File | null = null;
  imagePreview?: string | null = null;

  constructor(initial?: QuestionSubmissionValues) {
    if (initial) Object.assign(this, initial);
  }
}

*/

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

  imageFile?: File | null = null;
  imagePreview?: string | null = null;

  constructor(init?: any) {
    Object.assign(this, init);

    // If editing and backend returned an image path
    if (init?.Image) {
      this.imagePreview = init.Image.startsWith("http")
        ? init.Image
        : `${import.meta.env.VITE_API_BASE_URL}${init.Image}`;
    }
  }
}
