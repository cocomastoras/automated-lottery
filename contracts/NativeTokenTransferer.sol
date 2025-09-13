// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NativeTokenTransferer {
    uint256 internal constant GAS_STIPEND_NO_STORAGE_WRITES = 2300;

    /**
     * @dev Internal function to transfer native tokens from a given originator
     *      to a recipient
     *
     * @param to        The address of the receiver.
     * @param amount    The amount to transfer.
     */
    function _performNativeTransfer(address to, uint256 amount) internal {
        assembly {
            if iszero( call(
                GAS_STIPEND_NO_STORAGE_WRITES,
                to,
                amount,
                0,
                0,
                0,
                0
            ))
            {
                revert(0,0)
            }
        }
    }

}
