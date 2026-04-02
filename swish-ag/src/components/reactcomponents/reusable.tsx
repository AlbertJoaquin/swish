type ContentItem = {
  title: string;
  description: string;
  image: string;
  alt: string;
  link?: string;
};

type Tab = {
  id: string;
  label: string;
  contents: ContentItem[];
};

type Props = {
  current: Tab | undefined;
};

const AboutInfo = ({ current }: Props) => {
  if (!current) return null;

  return (
    <>
      {current.contents.map((item, index) => (
        <div className="tab-content-about" key={index}>
          <img
            className="img-component"
            src={item.image}
            alt={item.alt}
            decoding="async"
          />
          <h2 className="title-component">{item.title}</h2>
          <p className="p-component">{item.description}</p>
          <br />
          {item.link && (
            <a
              className="featured-about"
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Site
            </a>
          )}
        </div>
      ))}
    </>
  );
};

export default AboutInfo;