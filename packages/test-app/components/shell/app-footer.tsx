import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconChevronDown,
  IconChevronRight,
  IconGift,
  IconHeadset,
  IconMail,
  IconPhone,
  IconQuestionMark,
} from "@tabler/icons-react";

// Figma-hosted assets (expire 7 days from design export — replace with local files)
const LOGO_WORDMARK =
  "https://www.figma.com/api/mcp/asset/9ae012d5-ffb1-4b11-8083-e43fc9087616";
const ACCOUNT_MANAGER_AVATAR =
  "https://www.figma.com/api/mcp/asset/79e06553-c439-4f61-97c7-5da3ec66bb98";
const APP_STORE_BADGE =
  "https://www.figma.com/api/mcp/asset/ad395b79-e065-4638-ba65-40d59eb149c0";
const GOOGLE_PLAY_BADGE =
  "https://www.figma.com/api/mcp/asset/ab967e41-a280-4778-baaa-b378a8a7b51e";

const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      "About Minivoda",
      "Ethical Practice",
      "Our Partners",
      "Company Policies",
    ],
  },
  {
    heading: "Tools & Products",
    links: [
      "Supplier Dashboard",
      "Showroom",
      "Minivoda Feeds",
      "Minivoda Connect",
    ],
  },
  {
    heading: "Support",
    links: ["FAQs", "Help Center", "Slack Channel", "Help Desk", "Email"],
  },
  {
    heading: "Connect",
    links: ["LinkedIn", "Facebook", "Instagram", "Refer & Earn"],
  },
];

function FooterDivider() {
  return <hr className="w-full border-white/10" />;
}

export function AppFooter() {
  return (
    <footer className="bg-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 pb-30 pt-16">
        {/* Contact sections */}
        <div className="flex gap-10">
          {/* Account manager */}
          <div className="flex flex-1 flex-col gap-5">
            <img
              src={ACCOUNT_MANAGER_AVATAR}
              alt="Account Manager"
              className="size-16 rounded-full object-cover"
            />
            <div>
              <p className="text-xl font-bold leading-8 tracking-[0.15px] text-background">
                Your account manager
              </p>
              <p className="text-base leading-7 text-background opacity-75">
                John Appleseed, EU Team
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <IconMail size={20} className="shrink-0 text-background" />
                <span className="text-base leading-7 text-background">
                  j.appleseed@minivoda.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone size={20} className="shrink-0 text-background" />
                <span className="text-base leading-7 text-background">
                  +44 7723 003820
                </span>
              </div>
            </div>
          </div>

          {/* Support team */}
          <div className="flex flex-1 flex-col gap-5">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary">
              <IconHeadset size={32} className="text-background" />
            </div>
            <div>
              <p className="text-xl font-bold leading-8 tracking-[0.15px] text-background">
                Contact the Support Team
              </p>
              <p className="text-base leading-7 text-background opacity-75">
                Get help with your account & any questions
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <IconMail size={20} className="shrink-0 text-background" />
                <span className="text-base leading-7 text-background">
                  support@minivoda.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone size={20} className="shrink-0 text-background" />
                <span className="text-base leading-7 text-background">
                  +44 7723 003820
                </span>
              </div>
            </div>
          </div>

          {/* Help center */}
          <div className="flex flex-1 flex-col gap-5">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary">
              <IconQuestionMark size={32} className="text-background" />
            </div>
            <div>
              <p className="text-xl font-bold leading-8 tracking-[0.15px] text-background">
                Visit the Help Center
              </p>
              <p className="text-base leading-7 text-background opacity-75">
                How-to guides, Tutorials, FAQs
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <IconChevronRight
                  size={20}
                  className="shrink-0 text-background"
                />
                <span className="text-base leading-7 text-background">
                  To the Help Center
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconChevronRight
                  size={20}
                  className="shrink-0 text-background"
                />
                <span className="text-base leading-7 text-background">
                  Frequently Asked Questions
                </span>
              </div>
            </div>
          </div>
        </div>

        <FooterDivider />

        {/* Wordmark */}
        <img
          src={LOGO_WORDMARK}
          alt="Minivoda"
          className="h-7"
          style={{ width: 161, objectFit: "contain", objectPosition: "left" }}
        />

        {/* Link columns */}
        <div className="flex gap-8">
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div
              key={heading}
              className="flex flex-1 flex-col gap-4 text-sm text-background"
            >
              <p className="font-medium leading-5.5 tracking-[0.1px]">
                {heading}
              </p>
              {links.map((link) => (
                <p key={link} className="leading-5 opacity-75">
                  {link}
                </p>
              ))}
            </div>
          ))}

          {/* App download badges */}
          <div className="flex flex-1 flex-col gap-4">
            <p className="whitespace-nowrap text-sm font-medium leading-5.5 tracking-[0.1px] text-background">
              Download the app
            </p>
            <img
              src={APP_STORE_BADGE}
              alt="Download on the App Store"
              className="h-10 w-30 rounded-md object-cover"
            />
            <img
              src={GOOGLE_PLAY_BADGE}
              alt="Get it on Google Play"
              className="h-10 w-30 rounded-md object-cover"
            />
          </div>
        </div>

        <FooterDivider />

        {/* Bottom bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-7 text-sm text-background">
            <span>© 2025 Minivoda LLC</span>
            <span>Terms and Conditions</span>
            <span>Privacy Policy</span>
          </div>
          <div className="flex items-center gap-7">
            <button className="flex items-center gap-3 text-sm text-background">
              English
              <IconChevronDown size={16} />
            </button>
            <button className="flex items-center gap-3 text-sm text-background">
              <span>$</span>
              <span>USD</span>
              <IconChevronDown size={16} />
            </button>
            <div className="flex items-center gap-5">
              <IconBrandLinkedin size={24} className="text-background" />
              <IconBrandInstagram size={24} className="text-background" />
              <IconBrandFacebook size={24} className="text-background" />
              <button className="flex items-center gap-2 rounded-lg bg-[#5620e1] px-3 py-3 text-sm font-medium text-white">
                Refer & earn
                <IconGift size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="flex flex-col gap-3 text-xs leading-5 tracking-[0.4px] text-muted-foreground">
          <p>
            Quisque consequat quis ante at tristique. Sed sed ullamcorper orci.
            Maecenas vulputate fringilla mi eu posuere. Vestibulum maximus
            aliquet metus non tempor. Quisque porta libero vitae sapien euismod
            pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Fusce finibus nibh orci, eu tristique nulla euismod sit amet. Donec
            id lorem vel nulla placerat imperdiet. Praesent lorem nisl, placerat
            quis est vehicula, hendrerit interdum sapien. In hac habitasse
            platea dictumst.
          </p>
          <p>
            Sed sed ullamcorper orci. Maecenas vulputate fringilla mi eu
            posuere. Vestibulum maximus aliquet metus non tempor. Quisque porta
            libero vitae sapien euismod pharetra. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Fusce finibus nibh orci, eu tristique
            nulla euismod sit amet. Donec id lorem vel nulla placerat imperdiet.
            Praesent lorem nisl, placerat quis est vehicula, hendrerit interdum
            sapien. In hac habitasse platea dictumst. Lorem ipsum dolor sit
            amet.
          </p>
          <p>
            Fusce finibus nibh orci, eu tristique nulla euismod sit amet. Donec
            id lorem vel nulla placerat imperdiet. Praesent lorem nisl, placerat
            quis est vehicula, hendrerit interdum sapien. In hac habitasse
            platea dictumst. Lorem ipsum dolor sit amet.
          </p>
        </div>
      </div>
    </footer>
  );
}
