gsap.from("#text-home",
    {
        opacity:0,
        duration:3,
    }
);

gsap.to("#header", {
    delay: 1,
    duration: 3,
    text: {
        value: "Welcome,Welders!",
        newClass: "text2",
        delimiter: "",
    },
});

gsap.from("#menu-grid-main",{
    delay:1,
    x:-400,
    duration:3
});
gsap.from("#menu-grid-main2",{
    delay:1,
    x:400,
    duration:3
});
gsap.from("#menu-grid-main3",{
    delay:1,
    x:-400,
    duration:3
});
gsap.from("#menu-grid-main-4",{
    delay:1,
    x:400,
    duration:3
});
