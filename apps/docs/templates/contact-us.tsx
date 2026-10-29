"use client";
import { Button } from "@amerfathullah/myds-react/button";
import {
  PhoneIcon,
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  PinIcon,
  TwitterXIcon,
  TiktokIcon,
} from "@amerfathullah/myds-react/icon";

export default function ContactUsTemplate() {
  return (
    <>
      <div className="bg-bg-gray-50 border-otl-gray-200 border-b">
        <div className="max-w-full px-6 py-10 text-center">
          <h1 className="font-heading text-heading-sm sm:text-heading-md text-center font-semibold">
            Contact Us
          </h1>
        </div>
      </div>

      <main className="divide-otl-divider divide-y">
        <section className="bg-bg-gray-50">
          <div className="border-otl-divider gap-6 py-12 lg:py-20 xl:mx-auto xl:grid xl:max-w-7xl xl:grid-cols-12 xl:border-x">
            <div className="col-span-10 col-start-2 flex items-center justify-center">
              <div className="flex flex-col gap-12 px-4 sm:flex-row sm:px-0">
                <div className="space-y-4.5 sm:w-1/3 lg:py-16">
                  <p className="text-txt-black-500 text-body-sm font-semibold uppercase tracking-[0.2em]">
                    Office
                  </p>

                  <div className="space-y-2">
                    <p className="text-body-xl font-semibold">
                      Ministry of Digital
                    </p>
                    <p className="text-txt-black-700 text-body-sm">
                      Aras 13, 14 &amp; 15, Blok Menara, Menara Usahawan
                      <br />
                      No. 18, Persiaran Perdana, Presint 2
                      <br />
                      Pusat Pentadbiran Kerajaan Persekutuan
                      <br />
                      62000 Putrajaya, Malaysia
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3">
                    {[
                      {
                        name: "Google Maps",
                        href: "https://www.google.com/maps/dir//Menara+Usahawan",
                      },
                      {
                        name: "Waze",
                        href: "https://www.waze.com/en/live-map/directions/menara-usahawan-persiaran-perdana-18-putrajaya",
                      },
                    ].map(({ name, href }) => (
                      <Button
                        key={name}
                        variant="default-outline"
                        size="medium"
                        className="rounded-full"
                        asChild
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PinIcon className="mr-2" />
                          <span className="font-medium">{name}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>

                <iframe
                  title="Google Map"
                  className="border-otl-gray-200 shadow-card rounded-xl border max-sm:aspect-square sm:w-2/3"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?width=800&height=450&hl=en&q=${encodeURIComponent(
                    "Menara Usahawan, Persiaran Perdana, Presint 2, 62100 Putrajaya",
                  )}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bg-white">
          <div className="xl:mx-auto xl:max-w-7xl">
            <div className="flex w-full flex-col">
              <div className="divide-otl-divider grid w-full flex-auto grid-cols-2 px-0 max-md:divide-y md:divide-x">
                {[
                  {
                    icon: <PhoneIcon className="size-6" />,
                    title: "Telephone",
                    desc: "+603-8000 example",
                    href: "tel:+603-8000 example",
                  },
                  {
                    icon: <EmailIcon className="size-6" />,
                    title: "E-mail",
                    desc: "example@digital.gov.my",
                    href: "mailto:example@digital.gov.my",
                  },
                ].map(({ icon, title, desc, href }) => (
                  <a
                    key={title}
                    href={href}
                    className="gap-4.5 group flex px-6 py-8 max-md:col-span-2"
                  >
                    <div className="bg-bg-primary-50 text-txt-primary size-10.5 flex items-center justify-center rounded-full">
                      {icon}
                    </div>
                    <div className="space-y-1 font-semibold">
                      <p className="text-txt-black-500 text-body-sm font-semibold uppercase tracking-[0.2em]">
                        {title}
                      </p>
                      <p className="text-txt-black-900 text-body-lg group-hover:underline">
                        {desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="divide-otl-divider border-otl-divider grid flex-none grid-flow-row grid-cols-4 divide-x border-t px-0 max-md:divide-y">
                {[
                  {
                    icon: <FacebookIcon className="size-6" />,
                    label: "Facebook",
                    url: "#",
                  },
                  {
                    icon: <InstagramIcon className="size-6" />,
                    label: "Instagram",
                    url: "#",
                  },
                  {
                    icon: <TwitterXIcon className="size-6" />,
                    label: "X",
                    url: "#",
                  },
                  {
                    icon: <TiktokIcon className="size-6" />,
                    label: "Tiktok",
                    url: "#",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-txt-black-700 hover:text-txt-black-900 text-body-sm hover:underline max-md:col-span-2"
                  >
                    <div className="col-span-1 flex flex-none flex-col items-center gap-2 py-6 md:gap-3 xl:w-[100px]">
                      <div className="bg-bg-primary-50 text-txt-primary size-10.5 flex items-center justify-center rounded-full">
                        {social.icon}
                      </div>
                      {social.label}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
