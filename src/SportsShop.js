import ds from 'dawnmobileUnits';

export default function update({ selected, world }) {

    const { tiles, mobileUnit } = selected || {};
    const selectedTile = tiles && tiles.length === 1 ? tiles[0] : undefined;
    const selectedBuilding = selectedTile?.building;

    // whats in bag 0 slot 0?
    const unitEquipment0 = mobileUnit && mobileUnit.bags.length > 0 ? mobileUnit.bags?.find(bag => bag.key == 0) : undefined;
    const unitBag0 = unitEquipment0.bag;
    const unitBag0Slot0 = unitBag0.slots?.find(slot => slot.key == 0);
    const item = unitBag0Slot0 ? unitBag0Slot0.item : undefined;
    const itemID = item ? item.id : undefined;

    const buildingEquipment0 = selectedBuilding && selectedBuilding.bags.length > 0 ? selectedBuilding.bags?.find(bag => bag.key == 0) : undefined;

    const buildingGreenSlot = 0;
    const buildingRedSlot = 1;

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

        /* Item Id found with graphql at https://services-ds-test.dev.playmint.com/
        game(id: "DAWNMOBILE_UNITS"){    
            state {
                items: nodes(match: {kinds: "Item"}) {
                    id
                    name: annotation(name: "name") {
                        value
                    }
                }
            }
        }
        */
        if (itemID != `0x6a7a67f0006f223600000001000000000000000000000002`) {
            ds.log('need flask of red goo in first slot top bag');
            return;
        }

        // spend it all 
        const purchasePrice = unitBag0Slot0.balance;
        const purchaseQuantity = purchasePrice / 2;

        //We need the IDs of the Engineer and building
        const mobileUnitID = mobileUnit.id;
        const buildingID = selectedBuilding.id;

        const mobileUnitBag = 0;//unitEquipment0 ? unitEquipment0 : 0;
        const buildingBag = 0;// buildingEquipment0 ? buildingEquipment0 : 0;

        //The slot and quantity for the first Input item
        const purchaseSlot = 0;// unitBag0Slot0;

        const dummyBagIdIncaseToBagDoesNotExist = `0x${'00'.repeat(24)}`;

        ds.dispatch(
            {
                // spend the red goo
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnitID,
                    [mobileUnitID, buildingID],
                    [mobileUnitBag, buildingBag],
                    [purchaseSlot, buildingRedSlot],
                    dummyBagIdIncaseToBagDoesNotExist,
                    purchasePrice,
                ],
            }
        )
        ds.dispatch(
            {
                // get the green goo
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnitID,
                    [buildingID, mobileUnitID],
                    [buildingBag, mobileUnitBag],
                    [buildingGreenSlot, purchaseSlot],
                    dummyBagIdIncaseToBagDoesNotExist,
                    purchaseQuantity,
                ]
            },
        );

        ds.log(`Buy ${purchaseQuantity} green for ${purchasePrice} red`);
    };


    const stock = () => {

        ds.log(`unitBag0 T2: ${unitBag0}`);
        ds.log(`unitBag0Slot0: ${unitBag0Slot0}`);

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
        if (itemID != `0x6a7a67f0cca240f900000001000000020000000000000000`) {
            ds.log('need galss of green goo in first slot top bag');
            return;
        }

        // restock with it all 
        const restockAmount = unitBag0Slot0.balance;

        //We need the IDs of the Engineer and building
        const mobileUnitID = mobileUnit.id;
        const buildingID = selectedBuilding.id;

        const mobileUnitBag = 0;// unitEquipment0 ? unitEquipment0 : 0;
        const buildingBag = 0; //buildingEquipment0 ? buildingEquipment0 : 0;

        //The slot and quantity for the first Input item
        const purchaseSlot = 0; // unitBag0Slot0;

        const dummyBagIdIncaseToBagDoesNotExist = `0x${'00'.repeat(24)}`;

        ds.dispatch(
            {
                // send the green goo
                name: 'TRANSFER_ITEM_MOBILE_UNIT',
                args: [
                    mobileUnitID,
                    [mobileUnitID, buildingID],
                    [mobileUnitBag, buildingBag],
                    [purchaseSlot, buildingGreenSlot],
                    dummyBagIdIncaseToBagDoesNotExist,
                    restockAmount,
                ],
            },
        );

        ds.log(`Restock shop with  ${restockAmount} green`);
    };

    return {
        version: 1,
        components: [
            {
                type: 'building',
                id: 'sports-shop',
                title: 'Sports Shop',
                summary: `Goo exchange`,
                content: [
                    {
                        id: 'default',
                        type: 'inline',
                        buttons: [
                            { 
                                text: 'Buy 100 Green Goo', 
                                type: 'action', 
                                action: buy, 
                                disabled: false
                            },
                            { 
                                text: 'Restock Green Goo', 
                                type: 'action', 
                                action: stock, 
                                disabled: false 
                            }
                        ],
                    },
                ],
            },
        ],
    };
}

