import ds from 'downstream';

export default function update({ selected, world }) {

    const { tiles, mobileUnit } = selected || {};
    const selectedTile = tiles && tiles.length === 1 ? tiles[0] : undefined;
    const selectedBuilding = selectedTile?.building;

    // whats in unit bag 0 slot 0?
    const unitEquipment0 = mobileUnit && mobileUnit.bags.length > 0 ? mobileUnit.bags?.find(bag => bag.key == 0) : undefined;
    const unitBag0 = unitEquipment0?.bag;
    const unitBag0Slot0 = unitBag0?.slots?.find(slot => slot.key == 0);
    const item = unitBag0Slot0 ? unitBag0Slot0.item : undefined;
    const itemID = item ? item.id : undefined;
    const balance = unitBag0Slot0 ? unitBag0Slot0.balance : 0;
    let hasGreenForStocking = itemID == `0x6a7a67f0cca240f900000001000000020000000000000000`;
    let hasRedForBuying = itemID == `0x6a7a67f0006f223600000001000000000000000000000002`;
    hasRedForBuying = hasRedForBuying && balance == 100;
    hasGreenForStocking = hasGreenForStocking && balance == 100;

    // whats in building bags?
    const greenBagKey = 0;
    const redBagKey = 1;
    let stocks = [[0,0,0,0],[0,0,0,0]];
    for (let e = 0; e < 2; e++) {
        const equipSlot = selectedBuilding.bags.find(bag => bag.key == e);
        if (!equipSlot)
            continue;
        for (let i=0; i < 4; i++) {
            const itemSlot = equipSlot.bag?.slots?.find(slot => slot.key == i);
            stocks[e][i] = itemSlot ? itemSlot.balance : 0;
        }
    }

    let freeGreenSlot = -1;
    for (let i = 0; i < 3; i+=2) {
        if (stocks[greenBagKey][i] == 0 && stocks[greenBagKey][i+1] == 0) {
            freeGreenSlot = i;
            break;
        }
    }
    let usedGreenSlot = -1;
    for (let i = 0; i < 4; i++) {
        if (stocks[greenBagKey][i] > 0) {
            usedGreenSlot = i;
            break;
        }
    }

    let freeRedSlot = -1;
    for (let i = 0; i < 4; i++) {
        if (stocks[redBagKey][i] == 0) {
            freeRedSlot = i;
            break;
        }
    }
    let usedRedSlot = -1;
    for (let i = 0; i < 4; i++) {
        if (stocks[redBagKey][i] > 0) {
            usedRedSlot = i;
            break;
        }
    }
    const canBuy = hasRedForBuying && (freeRedSlot != -1) && (usedGreenSlot != -1);
    let buyNote = canBuy ? "Swap 100 Red Flask for 50 Green Glasses?" : `<p>Sorry you cannot purchase.<\p>`;
    if (!canBuy) {
        buyNote += hasRedForBuying ? `` : `<p>You need 100 Flasks of Red Goo.<\p>`;
        buyNote += freeRedSlot >= 0 ? `` : `<p>Shop cannot take any more Flasks!<\p>`;
        buyNote += usedGreenSlot >= 0 ? `` : `<p>Out of Stock!<\p>`;
    }

    const canRestock = hasGreenForStocking && (freeGreenSlot != -1);
    let restockNote = canBuy ? "Stock shop with 100 Glasses of Green Goo?" : `<p>Sorry you cannot restock.<\p>`;
    if (!canBuy) {
        restockNote += hasGreenForStocking ? `` : `<p>You need 100 Glasses of Green Goo.<\p>`;
        restockNote += freeGreenSlot >= 0 ? `` : `<p>Shop cannot take any more Glasses!<\p>`;
    }

    const canCashout = balance == 0 && (usedRedSlot != -1);
    let cashoutNote = canBuy ? "Casshout Red Flasks spent in shop?" : `<p>Sorry you cannot chasout.<\p>`;
    if (!canBuy) {
        cashoutNote += balance == 0 ? `` : `<p>You need an empty left slot in top bag.<\p>`;
        cashoutNote += usedRedSlot != -1 ? `` : `<p>No Red Flasks to chash out!<\p>`;
    }

    const buy = () => {

        if (!mobileUnit) {
            ds.log('no selected mobile unit');
            return;
        }
        if (!selectedBuilding) {
            ds.log('no selected building');
            return;
        }

        if (!itemID) {
            ds.log('no item in top bag first slot');
            return;
        }

        if (!hasRedForBuying) {
            ds.log('need 100 x flask of red goo in first slot top bag');
            return;
        }

        const dummyBagIdIncaseToBagDoesNotExist = `0x${'00'.repeat(24)}`;

        ds.dispatch(
            {
                // spend the red goo
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnit.id,
                    [mobileUnit.id, selectedBuilding.id],
                    [0, redBagKey],
                    [0, freeRedSlot],
                    dummyBagIdIncaseToBagDoesNotExist,
                    100,
                ],
            },  
            {
                // get the green goo
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnit.id,
                    [selectedBuilding.id, mobileUnit.id],
                    [0, greenBagKey],
                    [usedGreenSlot, 0],
                    dummyBagIdIncaseToBagDoesNotExist,
                    50,
                ]
            },
        );

        ds.log(`Buy 50 green for 100 red`);
    };

    const stock = () => {


        if (!mobileUnit) {
            ds.log('no selected mobile unit');
            return;
        }
        if (!selectedBuilding) {
            ds.log('no selected building');
            return;
        }
        if (!itemID) {
            ds.log('no item in top bag first slot');
            return;
        }
        if (!hasGreenForStocking) {
            ds.log('need 100 glass of green goo in first slot top bag');
            return;
        }

        const dummyBagIdIncaseToBagDoesNotExist = `0x${'00'.repeat(24)}`;

        ds.dispatch(
            {
                // send the green goo into two slots
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnit.id,
                    [mobileUnit.id, selectedBuilding.id],
                    [0, greenBagKey],
                    [0, freeGreenSlot],
                    dummyBagIdIncaseToBagDoesNotExist,
                    50,
                ]
            },
            {
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnit.id,
                    [mobileUnit.id, selectedBuilding.id],
                    [0, greenBagKey],
                    [0, freeGreenSlot+1],
                    dummyBagIdIncaseToBagDoesNotExist,
                    50,
                ]
            },
        );

        ds.log(`Restock shop with 100 green`);
    };

    const chashOut = () => {


        if (!mobileUnit) {
            ds.log('no selected mobile unit');
            return;
        }
        if (!selectedBuilding) {
            ds.log('no selected building');
            return;
        }
        if (itemID) {
            ds.log('item in top bag first slot');
            return;
        }

        const dummyBagIdIncaseToBagDoesNotExist = `0x${'00'.repeat(24)}`;

        ds.dispatch(
            {
                // get the redflasks
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnit.id,
                    [selectedBuilding.id, mobileUnit.id],
                    [redBagKey, 0],
                    [usedRedSlot, 0],
                    dummyBagIdIncaseToBagDoesNotExist,
                    100,
                ]
            }
        );

        ds.log(`Withdrawing 100 red`);
    };

    return {
        version: 1,
        components: [
            {
                type: 'building',
                id: 'grren-goo-shop',
                title: 'Green Goo Shop',
                summary: `Get Green goo for Red Good at (1:2)`,
                content: [
                    {
                        id: 'default',
                        type: 'inline',
                        html: buyNote,
                        buttons: [
                            { 
                                text: 'Buy 50 Green Goo', 
                                type: 'action', 
                                action: buy, 
                                disabled: !canBuy
                            },
                            { 
                                text: 'Stock Take', 
                                type: 'toggle', 
                                content: 'stock',
                                disabled: false 
                            }
                        ],
                    },
                    {
                        id: 'stock',
                        type: 'inline',
                        html: `
                            ${restockNote}
                            <p>Green:${stocks[0]}</p>
                            <p>Red  :${stocks[1]}</p>
                            `,
                        buttons: [
                            { 
                                text: 'Restock Green Goo', 
                                type: 'action', 
                                action: stock, 
                                disabled: !canRestock 
                            },
                            { 
                                text: 'Cash out Red Goo', 
                                type: 'action', 
                                action: chashOut, 
                                disabled: !canCashout 
                            },
                            { 
                                text: 'Shop', 
                                type: 'toggle', 
                                content: 'default',
                                disabled: false 
                            }
                        ],
                    },
                ],
            },
        ],
    };
}

