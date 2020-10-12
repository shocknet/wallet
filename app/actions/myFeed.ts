import * as Common from 'shock-common'

export type BeganFetchPageAction = {
  type: 'myFeed/beganFetchPage'
  data:{
    page:number
  }
}
export type FinishedFetchPageAction = {
  type: 'myFeed/finishedFetchPage'
  data:{
    page:number,
    posts:Common.Schema.Post[]
  }
}
export type ErrorFetchPageAction = {
  type: 'myFeed/errorFetchPage'
  data:{
    page:number,
    error: string
  }
}

export type FeedActions =
  BeganFetchPageAction
  | FinishedFetchPageAction
  | ErrorFetchPageAction


export const beganFetchPage = (page:number):BeganFetchPageAction => ({
  type:'myFeed/beganFetchPage',
  data:{page}
})
export const finishedFetchPage = (page:number,posts:Common.Schema.Post[]):FinishedFetchPageAction => ({
  type:'myFeed/finishedFetchPage',
  data:{
    page,
    posts
  }
})
export const errorFetchPage = (page:number,error:string):ErrorFetchPageAction => ({
  type:'myFeed/errorFetchPage',
  data:{
    page,
    error
  }
})

