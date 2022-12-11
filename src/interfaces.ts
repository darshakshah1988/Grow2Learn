export interface Course {
    id: number
    name: string
    units: Unit[]
}

export interface Unit {
    id: number
    name: string
    cards: Card[]
}

export interface Card {
    id: number
    name: string
    content: string
    evidence_task: string
    quiz: Quiz
    media: string
}

export interface Quiz {
    questions: Question[]
}

export interface Question {
    question: string
    answers: Answer[]
}

export interface Answer {
    text: string
    correct: boolean
}

export interface Action {
    text: string
}
export interface Agenda {
    topic: string,
    actions: Array<Action>
}