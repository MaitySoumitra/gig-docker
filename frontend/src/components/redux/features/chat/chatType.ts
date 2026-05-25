export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Message {
  _id: string;
  conversationId?: string;
  text: string;
  sender: {
    _id: string;
    name: string;
  };
  seen: boolean;
  createdAt: string;
  file?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
}

/* 🔥 FIXED */
export interface Conversation {
  _id: string;
  members: User[];
}

export interface ChatRequest {
  _id: string;
  from: User;
  createdAt: string;
}
