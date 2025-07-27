const RateLimitReach = () => {
    return (
        <section className="grid justify-center content-center text-center min-h-[60vh] font-popi">
            <h1 className="text-6xl mb-3 font-orbi">429</h1>
            <h4>Too many Requests</h4>
            <p className="mb-4 text-xl">You have sent too many requests in a given amount of time. Please try again later</p>
            <div className="flex justify-center">
                <a href="/" className="w-fit"><button className="bg-accn dark:bg-drka text-prim dark:text-drkp py-2 rounded-lg w-full
                    bg-[length:100%_200%] bg-[position:0_0] bg-gradient-to-b from-accn dark:from-drka
                    from-50% via-secd dark:via-drks via-50% to-secd dark:to-drks to-90% hover:bg-[position:0_100%]
                    transition-all ease-in hover:text-text dark:hover:text-drkt font-semibold p-2"
                    >Home Page</button></a>
            </div>
                
            <div className="mt-24">
                <span>Facing any issue? </span>
                <a href="/webteam?tab=enquiry" className="cursor-pointer text-dark:text-drka">Contact</a>
            </div>
        </section>
    )
}

export default RateLimitReach;