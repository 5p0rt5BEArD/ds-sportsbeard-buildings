import ds from 'downstream';

export default function update({ selected }) {

    const { mobileUnit } = selected || {};

    const unitHasItem = (itemID) => {
        return (mobileUnit?.bags || [])
            .map(equipment => equipment.bag)
            .filter(bag => !!bag)
            .flatMap(bag => bag.slots)
            .filter(slot => !!slot.item)
            .some(slot => slot.item.id == itemID);
    };

    const unitHasSmellyDuck = unitHasItem('0x6a7a67f00000006800000000000000000000000000000032');

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
                                disabled: !unitHasSmellyDuck
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

