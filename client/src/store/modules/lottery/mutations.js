export function setCurrentRound(
  state,
  { roundID, poolPrize, participants, minEnterAmount, maxRoundParticipants, expiration }
) {
  state.currentRound.roundID = roundID;
  state.currentRound.poolPrize = poolPrize;
  state.currentRound.participants = participants;
  state.currentRound.minEnterAmount = minEnterAmount;
  state.currentRound.maxRoundParticipants = maxRoundParticipants;
  state.currentRound.expiration = expiration;
}
