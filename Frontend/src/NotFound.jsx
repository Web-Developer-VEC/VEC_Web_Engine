const NotFound = () => {
    return (
        <section className="grid justify-center content-center text-center min-h-[60vh] font-popi">
            <h1 className="text-6xl mb-3 font-orbi">404</h1>
            <h4>Something went wrong</h4>
            <p className="mb-4 text-xl">No such link exists</p>
            <a href="/"><button className="bg-accn dark:bg-drka text-prim dark:text-drkp py-2 rounded-lg w-full
                bg-[length:100%_200%] bg-[position:0_0] bg-gradient-to-b from-accn dark:from-drka
                from-50% via-secd dark:via-drks via-50% to-secd dark:to-drks to-90% hover:bg-[position:0_100%]
                transition-all ease-in hover:text-text dark:hover:text-drkt font-semibold"
                >Home Page</button></a>
        </section>
    )
}

export default NotFound;