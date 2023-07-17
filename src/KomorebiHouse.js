import ds from 'downstream';

export default function update({ selected }) {

    const { mobileUnit } = selected || {};

    // whats in unit bag 0 slot 0?
    const unitEquipment0 = mobileUnit && mobileUnit.bags.length > 0 ? mobileUnit.bags?.find(bag => bag.key == 0) : undefined;
    const unitBag0 = unitEquipment0?.bag;
    const unitBag0Slot0 = unitBag0?.slots?.find(slot => slot.key == 0);
    const item = unitBag0Slot0 ? unitBag0Slot0.item : undefined;
    const itemID = item ? item.id : undefined;
    let hasItemToEnter = itemID == `0x6a7a67f0cca240f900000001000000020000000000000000`;

    return {
        version: 1,
        components: [
            {
                type: 'building',
                id: 'komo-hacker-house',
                title: 'Komorebi Hacker House',
                summary: `Do you have what it takes to enter?`,
                content: [
                    {
                        id: 'default',
                        type: 'inline',
                        buttons: [
                            { 
                                text: 'Enter', 
                                type: 'toggle', 
                                content: 'house', 
                                disabled: !hasItemToEnter
                            }
                        ],
                    },
                    {
                        id: 'house',
                        type: 'inline',
                        html: `
                            <img src="https://pbs.twimg.com/media/F02pwvgakAAR11D?format=jpg&name=large" />
                        `,
                        buttons: [
                            { 
                                text: 'Leave', 
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

