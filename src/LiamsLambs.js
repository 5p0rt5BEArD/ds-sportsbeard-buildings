import ds from 'dawnseekers';

export default function update({ selected, world }) {

    const { tiles, seeker } = selected || {};
    const selectedTile = tiles && tiles.length === 1 ? tiles[0] : undefined;
    const selectedBuilding = selectedTile?.building;
    const selectedEngineer = seeker;

    // fetch the expected inputs item kinds
    const requiredInputs = selectedBuilding?.kind?.inputs || [];
    const want0 = requiredInputs.find(inp => inp.key == 0);
    const want1 = requiredInputs.find(inp => inp.key == 1);

    // fetch what is currently in the input slots
    const inputSlots = selectedBuilding?.bags.find(b => b.key == 0).bag?.slots || [];
    const got0 = inputSlots?.find(slot => slot.key == 0);
    const got1 = inputSlots?.find(slot => slot.key == 1);

    // fetch our output item details
    const expectedOutputs = selectedBuilding?.kind?.outputs || [];
    const out0 = expectedOutputs?.find(slot => slot.key == 0);

    // try to detect if the input slots contain enough stuff to craft
    const canCraft = selectedEngineer
        && want0 && got0 && want0.balance == got0.balance;

    const craft = () => {
        if (!selectedEngineer) {
            ds.log('no selected engineer');
            return;
        }
        if (!selectedBuilding) {
            ds.log('no selected building');
            return;
        }

        ds.dispatch(
            {
                name: 'BUILDING_USE',
                args: [selectedBuilding.id, selectedEngineer.id, []]
            },
        );

        ds.log('Liam smiles upon you');
    };

    return {
        version: 1,
        components: [
            {
                type: 'building',
                id: 'liams-lambs',
                title: 'Liam`s Lambs',
                summary: `I will trade a lamb for some stuff!`,
                content: [
                    {
                        id: 'default',
                        type: 'inline',
                        buttons: [{ text: 'Lamb me, Liam!', type: 'action', action: craft, disabled: !canCraft }],
                    },
                ],
            },
        ],
    };
}

