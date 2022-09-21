// Create a new table called "ActiveItem"
// Add items when they are listed on the marketplace
// Remove them when they are bought or canceled

Moralis.Cloud.afterSave("ItemListed", async (request) => {
    // Every event gets triggered twice, once on unconfirmed, again on confirmed
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Listing Item! Looking for confirmed TX...");

    if (confirmed) {
        logger.info("Found item!");
        const ActiveItem = Moralis.Object.extend("ActiveItem");

        // In case of listing update, search for already listed ActiveItem and delete
        // Then list it again with a new price
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("seller", request.object.get("seller"));
        logger.info(`Marketplace | Query: ${query}`);
        const alreadyListedItem = await query.first();
        console.log(`AlreadyListedItem found! ${JSON.stringify(alreadyListedItem)}`);
        if (alreadyListedItem) {
            logger.info(`Deleting ${alreadyListedItem.id}`);
            await alreadyListedItem.destroy();
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since the listing is being updated. `
            );
        }

        // Add new ActiveItem
        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(
            `Adding item with tokenId ${request.object.get(
                "tokenId"
            )} at address: ${request.object.get("address")}.`
        );
        await activeItem.save();
        logger.info("Active Item saved!");
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Cancel Item! Looking for confirmed TX...");
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        logger.info(`Looking for query to cancel the item...`);
        const canceledItem = await query.first();
        logger.info(`Query found! Can be canceled!`);
        logger.info(`Marketplace | CanceledItem: ${JSON.stringify(canceledItem)}`);
        if (canceledItem) {
            logger.info(`Deleting ${canceledItem.id}`);
            await canceledItem.destroy();
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get(
                    "address"
                )} from ActiveItem table since it was canceled.`
            );
        } else {
            logger.info(
                `No item to cancel with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} found!`
            );
        }
    }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Buy Item! Looking for confirmed TX...");
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        logger.info(`Looking for query to delish bought item...`);
        const boughtItem = await query.first();
        logger.info(`Query found! Can be delisted as bought!`);
        logger.info(`Marketplace | boughtItem: ${JSON.stringify(boughtItem)}`);
        if (boughtItem) {
            logger.info(`Deleting bought item ${boughtItem.id}...`);
            await boughtItem.destroy();
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get(
                    "address"
                )} from ActiveItem table since it was bought.`
            );
        } else {
            logger.info(
                `No item to buy with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} found!`
            );
        }
    }
});
