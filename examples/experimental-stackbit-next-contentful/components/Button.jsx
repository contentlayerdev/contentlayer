import Link from 'next/link';

const themeClassMap = {
    default: 'border-violet-800 bg-violet-800 text-white hover:bg-violet-600 hover:border-violet-600',
    outline: 'border-black bg-transparent text-black hover:text-gray-500 hover:border-gray-500'
};

export const Button = (props) => {
    return (
        <Link
            href={props.url}
            className={`py-3 px-8 inline-block border rounded-md transition-all duration-300 ${themeClassMap[props.theme] ?? themeClassMap['default']}`}
        >
            {props.label}
        </Link>
    );
};
