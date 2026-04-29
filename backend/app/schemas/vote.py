from pydantic import BaseModel


class VoteResponse(BaseModel):
    voted: bool
    vote_count: int


class VoteStatusResponse(BaseModel):
    voted: bool