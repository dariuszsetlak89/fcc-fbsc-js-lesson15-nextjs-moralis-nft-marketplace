import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
    // How do we show the recently listed NFTs?
    // const value = await useApiContract.getListing(""); // normal way

    // We will index the events off-chain and then read from our database.
    // Setup a server to listen for those events to be fired, and we will add them to a ???

    //TheGraph does this in a decentralized way
    // Moralis does it in a centralized way and comes with a ton of other features.

    // All our logic is still 100% on chain.
    // Speed & Development time.
    // Its really hard to start a prod blockchair project 100% decentralized
    // Moralis are working on open sourcing their code.
    // Feature richness
    // We can create more features with a centralized back end to start
    // As more decentralized tools are being created.
    // Local development

    const { isWeb3Enabled } = useMoralis();
    const numberOfItems = 100;
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        // TableName, Function for the query
        // How it works: Grab from database useMoralisQuery only ActiveItem table and grab only the first x in descending order of the tokenIds (from x to 0)
        // Save the results of fetching in 'listedNfts' section
        "ActiveItem",
        (query) => query.limit(numberOfItems).descending("tokenId")
    );
    console.log(listedNfts);

    return (
        <div className="container mx-auto">
            <h1 className="px-4 pt-4 pb-2 font-bold text-2xl">Recently listed NFT items</h1>
            <h2 className="px-4 pt-2 pb-8">
                If you own the item, click to update it's selling price! If not, click to buy it!
            </h2>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            console.log(nft.attributes);
                            const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                                nft.attributes;
                            return (
                                <div className="m-2">
                                    <NFTBox
                                        price={price}
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`}
                                    />
                                </div>
                            );
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    );
}
