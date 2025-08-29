const SectionTitle = ({ heading }) => {
  return (
    <div className="lg:w-5/12 w-10/12 mx-auto text-center my-6">
      <h2 className="noto-serif-bengali-normal text-2xl md:text-4xl py-4 border-y-2 border-green-300 text-green-700 tracking-wide">
        {heading}
      </h2>
    </div>
  );
};

export default SectionTitle;
